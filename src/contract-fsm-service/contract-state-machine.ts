import {ClientSession} from 'mongoose';
import {BreakOffError, LogicError} from 'egg-freelog-base';
import {first} from 'lodash';
import * as StateMachine from 'javascript-state-machine';
import {IApplicationContext, providerWrapper} from 'midway';
import {ContractFsmEventHandler} from './contract-fsm-event-handler';
import {ContractFsmRunningStatusEnum, PolicyEventEnum} from '../enum';
import {ContractFsmEventPretreatment} from './contract-fsm-event-pretreatment';
import {ContractFsmEventTransitionAfterHandler} from './contract-fsm-event-transition-after-handler';
import {ContractInfo, IContractStateMachine, IContractTriggerEventMessage, PolicyEventInfo} from '../interface';
import {ContractFsmInvalidTransitionHandler} from './contract-fsm-invalid-transition-handler';

/**
 * 合同状态机这一块设计思路:(2021-02-22)
 * 1.事件的发起源分为两种.
 * a.单例事件,此事件不受人为触发影响,由系统指定单例服务触发, 例如时间相关事件或周期相关事件。 b.自然事件,人为主动式触发事件,例如签约,付款等。
 * 2.为了保证合约接受的顺序与事件实际发生的顺序一致,目前所有的事件都发送到消息队列中,然后合约服务只接受消息队列的有序事件,依次执行
 * 3.目前合约的事件通过合约ID进行hash分区取模之后进行物理隔离,所以可以保证同一个合约的一系列事件一定在同一个分区中有序排列.
 * 4.合约的状态机部分只解析规则(动态根据策略生成状态机的流转数据).事件相关的操作在其他模块完成.合同事件的每一次发起都需要做事务操作.
 * 5.合同事件执行分为事件前置处理,事件执行中,状态切换后等细分的模块.不同生命周期的处理只需要在对应的模块实现即可,不需要单独处理的则忽略.
 * 6.支付等需要外部服务进行主导的事件(自然事件),则先通过合约服务调用支付相关的服务.支付服务会冻结对应的金额,然后发送事件到消息队列.合约状态机接收到
 * 支付事件之后,会对当前状态进行对比,然后调用合约状态机,之后把结果通知到支付服务做实际的扣除或解冻操作.
 * [旧版支付是通过testAndSet互斥锁实现,新版主要是考虑到消息的实际发送顺序,以及消息队列服务可能宕机导致其他之前产生的事件不能正确按实际发生顺序生效
 * 新版同时移除了合约的锁状态.因为合约的事件本身已经顺序逐条执行,不存在同一个合约并发处理好几个事件的情况,所以锁存在的意义就没有了
 * 新版修改了事件的注册机制,旧版是状态切换之后,把新状态可能需要注册的事件一条一条的发送注册,新版则直接批量一次性发送,然后合约服务同时事务来处理.
 * 要么批量成功,要么失败.同时把旧状态事件取消注册融入到注册业务中.即注册业务通过事务批量注册新事件,同时删除旧的事件侦听.
 * 由于事件注册是通过消息队列发送,所以注册失败的话,不影响本次合约的状态流转.但是合约会锁定状态(时间注册中),锁定期合约暂不接受其他事件.
 * 然后后续会通过消息job的方式继续注册,直到成功为止]
 */
/**
 * https://github.com/jakesgordon/javascript-state-machine/blob/master/docs/lifecycle-events.md
 */
class ContractStateMachine implements IContractStateMachine {

    fsm: StateMachine;
    contractInfo: ContractInfo;
    fromInitialStateName = '_none_';
    eventMap: Map<string, PolicyEventInfo> = new Map();

    session: ClientSession;
    latestTransitionStateId: string;
    eventInfo: IContractTriggerEventMessage;
    contractFsmEventHandler: ContractFsmEventHandler;
    contractFsmEventPretreatment: ContractFsmEventPretreatment;
    contractFsmEventTransitionAfterHandler: ContractFsmEventTransitionAfterHandler;
    contractFsmInvalidTransitionHandler: ContractFsmInvalidTransitionHandler;

    /**
     * 初始化
     * @param contractInfo
     * @param context
     */
    constructor(contractInfo: ContractInfo, context: IApplicationContext) {
        if (!contractInfo?.policyInfo) {
            throw new LogicError('合约信息不全,请检查合约以及策略信息');
        }
        this.contractInfo = contractInfo;
        this.contractFsmEventHandler = context.get('contractFsmEventHandler');
        this.contractFsmEventPretreatment = context.get('contractFsmEventPretreatment');
        this.contractFsmInvalidTransitionHandler = context.get('contractFsmInvalidTransitionHandler');
        this.contractFsmEventTransitionAfterHandler = context.get('contractFsmEventTransitionAfterHandler');

        // 初始化事件名称为init.目前合约初始化需要主动调用initial,所以需要显示的申明init事件定义
        this.eventMap.set('init', {eventId: 'init', code: PolicyEventEnum.InitialEvent} as PolicyEventInfo);

        const stateMachineOptions = {
            init: contractInfo.fsmCurrentState,
            transitions: this._fsmDescriptionInfoWarpToFsmTransitions(),
            methods: {
                onEnterState: this.onEnterState.bind(this),
                onTransition: this.onTransition.bind(this),
                onBeforeTransition: this.onBeforeTransition.bind(this),
                onAfterTransition: this.onAfterTransition.bind(this),
                onInvalidTransition: this.onInvalidTransition.bind(this),
            }
        };
        if ([ContractFsmRunningStatusEnum.Uninitialized, ContractFsmRunningStatusEnum.InitializedError].includes(this.contractInfo.fsmRunningStatus)) {
            Reflect.deleteProperty(stateMachineOptions, 'init');
            const initialState = Object.entries(this.contractInfo.policyInfo.fsmDescriptionInfo).find(([_, value]) => value.isInitial);
            stateMachineOptions.transitions.unshift({
                name: PolicyEventEnum.InitialEvent.toString(),
                from: this.fromInitialStateName, to: first(initialState)
            });
        }
        StateMachine.defaults.init.from = this.fromInitialStateName;
        this.fsm = new StateMachine(stateMachineOptions);
    }

    /**
     * 是否可以执行指定事件
     * @param eventId
     */
    isCanExecEvent(eventId: string) {
        if (this.contractInfo.fsmRunningStatus !== ContractFsmRunningStatusEnum.Running) {
            return false;
        }
        return this.fsm.can(eventId);
    }

    /**
     * 获取事件信息
     * @param eventId
     */
    getEventInfo(eventId: string): PolicyEventInfo {
        return this.eventMap.get(eventId);
    }

    /**
     * 初始化合约
     * @param session
     */
    execInitial(session: ClientSession) {
        if (![ContractFsmRunningStatusEnum.InitializedError, ContractFsmRunningStatusEnum.Uninitialized].includes(this.contractInfo.fsmRunningStatus)) {
            throw new LogicError('不能重复初始化');
        }
        this.session = session;
        this.eventInfo = {
            contractId: this.contractInfo.contractId, code: 'init', eventId: 'init', eventTime: new Date()
        } as any;
        return this.fsm.init().catch(error => {
            console.log(error);
            // this.contractFsmEventHandler.contractInitialErrorHandle(this.contractInfo, this.eventInfo, error?.toString()).then();
            throw error;
        });
    }

    /**
     * 执行合约事件(后面需要传递事务句柄.所有的数据操作都在事务句柄上完成,任意的异常都会导致事务回滚.事件执行异常)
     * 异常需要加上特定的错误码.然后根据错误码来确定是逻辑问题还是系统问题.若是系统问题,则需要发起重试
     * @param session
     * @param eventInfo
     * @param args (不同事件会有不同的参数体系,只需要原样传递,由专门的事件处理函数来负责特定的业务)
     */
    execContractEvent(session: ClientSession, eventInfo: IContractTriggerEventMessage, ...args) {
        if (this.contractInfo.fsmRunningStatus === ContractFsmRunningStatusEnum.ToBeRegisteredEvents) {
            throw new LogicError('合约当前正在等待注册事件,请稍后再试');
        }
        // 此处不在做isCanExecEvent校验.主要考虑是需要针对部分无效事件做单独的处理.例如支付事件
        if (!this.fsm.allTransitions().includes(eventInfo?.eventId)) {
            // 此处不抛异常.无需消息队列中断重试执行. 正常逻辑不会进入到此处.万一进入,是程序逻辑层面数据不对等.
            return this.contractFsmInvalidTransitionHandler.invalidTransitionHandle(this.contractInfo, session, eventInfo, '非正常数据.事件与合约不匹配');
        }
        this.session = session;
        this.eventInfo = eventInfo;
        return this.fsm[eventInfo.eventId].call(this.fsm, ...args).catch(this.errorHandle);
    }

    /**
     * 进入状态之前做的操作,例如初始化合约.交易验证等
     * @param lifeCycle
     * @param args
     */
    onBeforeTransition(lifeCycle, ...args) {
        if (this._isInvalidStateTransition(lifeCycle)) {
            return;
        }
        const currentEventInfo = this.eventMap.get(lifeCycle.transition);
        const eventHandleFuncName = `onBefore${currentEventInfo.code}Handle`;
        if (!currentEventInfo || !Reflect.has(this.contractFsmEventPretreatment, eventHandleFuncName)) {
            return;
        }
        return Reflect.apply(this.contractFsmEventPretreatment[eventHandleFuncName], this.contractFsmEventPretreatment, [this.contractInfo, this.session, this.eventInfo]);
    }

    /**
     * 调用事件时,执行对应的操作
     * @param lifeCycle
     * @param args
     */
    onTransition(lifeCycle, ...args) {
        if (this._isInvalidStateTransition(lifeCycle)) {
            return;
        }
        const currentEventInfo = this.eventMap.get(lifeCycle.transition);
        const eventHandleFuncName = `exec${currentEventInfo.code}Handle`;
        // 如果事件不需要单独处理,则默认返回true
        if (!currentEventInfo || !Reflect.has(this.contractFsmEventHandler, eventHandleFuncName)) {
            return;
        }
        return Reflect.apply(this.contractFsmEventHandler[eventHandleFuncName], this.contractFsmEventHandler, [this.contractInfo, this.session, this.eventInfo, ...args]);
    }

    /**
     * 进入状态之后执行的事件(此函数主要用来记录状态变更记录)
     * @param lifeCycle
     * @param args
     */
    onEnterState(lifeCycle, ...args) {
        if (this._isInvalidStateTransition(lifeCycle)) {
            return;
        }
        return this.contractFsmEventHandler.syncOrderStateAndChangedHistory(this.contractInfo, this.session, this.eventInfo, lifeCycle.transition, lifeCycle.from, lifeCycle.to).then(latestTransitionStateId => {
            this.latestTransitionStateId = latestTransitionStateId;
        });
    }

    /**
     * 状态流转之后(此处做事件注册和取消注册)
     * 事件注册作为流程的最后一步,是因为注册不是使用的事务(mq),需要前面的流程保证能够正确执行完成.
     * @param lifeCycle
     */
    onAfterTransition(lifeCycle) {
        if (this._isInvalidStateTransition(lifeCycle)) {
            return;
        }
        const currentEventInfo = this.eventMap.get(lifeCycle.transition);
        const eventHandleFuncName = `exec${currentEventInfo.code}Handle`;
        const commonHandle = this.contractFsmEventTransitionAfterHandler.registerContractEvents(this.contractInfo, this.session, lifeCycle.from, lifeCycle.to);
        // 如果事件不需要单独处理,则默认返回true
        if (!currentEventInfo || !Reflect.has(this.contractFsmEventTransitionAfterHandler, eventHandleFuncName)) {
            console.log('===================================');
            return commonHandle;
        }
        const specificEventHandle = Reflect.apply(this.contractFsmEventTransitionAfterHandler[eventHandleFuncName], this.contractFsmEventTransitionAfterHandler, [this.contractInfo, this.session, this.eventInfo, this.latestTransitionStateId]);
        return Promise.all([commonHandle, specificEventHandle]);
    }

    /**
     * 无效的事件处理
     * @param transition
     */
    onInvalidTransition(transition) {
        const currentEventInfo = this.eventMap.get(transition);
        const eventHandleFuncName = `exec${currentEventInfo?.code}InvalidEventHandle`;
        const commonHandle = this.contractFsmInvalidTransitionHandler.invalidTransitionHandle(this.contractInfo, this.session, this.eventInfo, '合约当前状态不允许执行此事件');
        console.log('==========无效事件,不处理==========');
        // 如果事件不需要单独处理,则默认返回true
        if (!currentEventInfo || !Reflect.has(this.contractFsmInvalidTransitionHandler, eventHandleFuncName)) {
            return commonHandle;
        }
        return commonHandle.then(() => {
            return Reflect.apply(this.contractFsmInvalidTransitionHandler[eventHandleFuncName], this.contractFsmInvalidTransitionHandler, [this.contractInfo, this.session, this.eventInfo]);
        });
    }

    /**
     * 错误处理
     * @param error
     */
    errorHandle(error: any) {
        if (!(error instanceof BreakOffError)) {
            throw error;
        }
        console.log('中断错误,不对外抛出异常,但是状态机也不拨动状态');
    }

    /**
     * 是否无效的状态流转
     */
    _isInvalidStateTransition(lifeCycle) {
        return lifeCycle.from === this.fromInitialStateName && ![ContractFsmRunningStatusEnum.Uninitialized, ContractFsmRunningStatusEnum.InitializedError].includes(this.contractInfo.fsmRunningStatus);
    }

    /**
     * 状态机描述对象转换成事件集
     * @returns {any[]}
     * @private
     */
    _fsmDescriptionInfoWarpToFsmTransitions() {
        const fsmTransitions = [];
        for (const [stateName, stateDescription] of Object.entries(this.contractInfo.policyInfo.fsmDescriptionInfo)) {
            for (const eventInfo of stateDescription.transitions) {
                if (!eventInfo?.eventId) {
                    throw new Error('策略对象存在异常,不存在事件ID');
                }
                this.eventMap.set(eventInfo.eventId, eventInfo);
                fsmTransitions.push({name: eventInfo.eventId, from: stateName, to: eventInfo.toState});
            }
        }
        return fsmTransitions;
    }
}

export function buildContractStateMachine(context: IApplicationContext) {
    return (contractInfo: ContractInfo): ContractStateMachine => {
        return new ContractStateMachine(contractInfo, context);
    };
}

providerWrapper([{
    id: 'buildContractStateMachine',
    scope: 'Prototype',
    provider: buildContractStateMachine
}]);


