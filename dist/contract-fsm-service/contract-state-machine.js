"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildContractStateMachine = void 0;
const egg_freelog_base_1 = require("egg-freelog-base");
const lodash_1 = require("lodash");
const StateMachine = require("javascript-state-machine");
const midway_1 = require("midway");
const enum_1 = require("../enum");
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
class ContractStateMachine {
    /**
     * 初始化
     * @param contractInfo
     * @param context
     */
    constructor(contractInfo, context) {
        this.fromInitialStateName = '_none_';
        this.eventMap = new Map();
        if (!contractInfo?.policyInfo) {
            throw new egg_freelog_base_1.LogicError('合约信息不全,请检查合约以及策略信息');
        }
        this.contractInfo = contractInfo;
        this.contractFsmEventHandler = context.get('contractFsmEventHandler');
        this.contractFsmEventPretreatment = context.get('contractFsmEventPretreatment');
        this.contractFsmInvalidTransitionHandler = context.get('contractFsmInvalidTransitionHandler');
        this.contractFsmEventTransitionAfterHandler = context.get('contractFsmEventTransitionAfterHandler');
        // 初始化事件名称为init.目前合约初始化需要主动调用initial,所以需要显示的申明init事件定义
        this.eventMap.set('init', { eventId: 'init', code: enum_1.PolicyEventEnum.InitialEvent });
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
        if ([enum_1.ContractFsmRunningStatusEnum.Uninitialized, enum_1.ContractFsmRunningStatusEnum.InitializedError].includes(this.contractInfo.fsmRunningStatus)) {
            Reflect.deleteProperty(stateMachineOptions, 'init');
            const initialState = Object.entries(this.contractInfo.policyInfo.fsmDescriptionInfo).find(([_, value]) => value.isInitial);
            stateMachineOptions.transitions.unshift({
                name: enum_1.PolicyEventEnum.InitialEvent.toString(),
                from: this.fromInitialStateName, to: lodash_1.first(initialState)
            });
        }
        StateMachine.defaults.init.from = this.fromInitialStateName;
        this.fsm = new StateMachine(stateMachineOptions);
    }
    /**
     * 是否可以执行指定事件
     * @param eventId
     */
    isCanExecEvent(eventId) {
        if (this.contractInfo.fsmRunningStatus !== enum_1.ContractFsmRunningStatusEnum.Running) {
            return false;
        }
        return this.fsm.can(eventId);
    }
    /**
     * 获取事件信息
     * @param eventId
     */
    getEventInfo(eventId) {
        return this.eventMap.get(eventId);
    }
    /**
     * 初始化合约
     * @param session
     */
    execInitial(session) {
        if (![enum_1.ContractFsmRunningStatusEnum.InitializedError, enum_1.ContractFsmRunningStatusEnum.Uninitialized].includes(this.contractInfo.fsmRunningStatus)) {
            throw new egg_freelog_base_1.LogicError('不能重复初始化');
        }
        this.session = session;
        this.eventInfo = {
            contractId: this.contractInfo.contractId, code: 'init', eventId: 'init', eventTime: new Date()
        };
        return this.fsm.init();
        //.catch(error => {
        //             this.contractFsmEventHandler.contractInitialErrorHandle(this.contractInfo, this.eventInfo, error?.toString()).then();
        //             throw error;
        //         })
    }
    /**
     * 执行合约事件(后面需要传递事务句柄.所有的数据操作都在事务句柄上完成,任意的异常都会导致事务回滚.事件执行异常)
     * 异常需要加上特定的错误码.然后根据错误码来确定是逻辑问题还是系统问题.若是系统问题,则需要发起重试
     * @param session
     * @param eventInfo
     * @param args (不同事件会有不同的参数体系,只需要原样传递,由专门的事件处理函数来负责特定的业务)
     */
    execContractEvent(session, eventInfo, ...args) {
        if (this.contractInfo.fsmRunningStatus === enum_1.ContractFsmRunningStatusEnum.ToBeRegisteredEvents) {
            throw new egg_freelog_base_1.LogicError('合约当前正在等待注册事件,请稍后再试');
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
    errorHandle(error) {
        if (!(error instanceof egg_freelog_base_1.BreakOffError)) {
            throw error;
        }
        console.log('中断错误,不对外抛出异常,但是状态机也不拨动状态');
    }
    /**
     * 是否无效的状态流转
     */
    _isInvalidStateTransition(lifeCycle) {
        return lifeCycle.from === this.fromInitialStateName && ![enum_1.ContractFsmRunningStatusEnum.Uninitialized, enum_1.ContractFsmRunningStatusEnum.InitializedError].includes(this.contractInfo.fsmRunningStatus);
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
                fsmTransitions.push({ name: eventInfo.eventId, from: stateName, to: eventInfo.toState });
            }
        }
        return fsmTransitions;
    }
}
function buildContractStateMachine(context) {
    return (contractInfo) => {
        return new ContractStateMachine(contractInfo, context);
    };
}
exports.buildContractStateMachine = buildContractStateMachine;
midway_1.providerWrapper([{
        id: 'buildContractStateMachine',
        scope: 'Prototype',
        provider: buildContractStateMachine
    }]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3Qtc3RhdGUtbWFjaGluZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cmFjdC1mc20tc2VydmljZS9jb250cmFjdC1zdGF0ZS1tYWNoaW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHVEQUEyRDtBQUMzRCxtQ0FBNkI7QUFDN0IseURBQXlEO0FBQ3pELG1DQUE0RDtBQUU1RCxrQ0FBc0U7QUFNdEU7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkc7QUFDSDs7R0FFRztBQUNILE1BQU0sb0JBQW9CO0lBZXRCOzs7O09BSUc7SUFDSCxZQUFZLFlBQTBCLEVBQUUsT0FBNEI7UUFoQnBFLHlCQUFvQixHQUFHLFFBQVEsQ0FBQztRQUNoQyxhQUFRLEdBQWlDLElBQUksR0FBRyxFQUFFLENBQUM7UUFnQi9DLElBQUksQ0FBQyxZQUFZLEVBQUUsVUFBVSxFQUFFO1lBQzNCLE1BQU0sSUFBSSw2QkFBVSxDQUFDLG9CQUFvQixDQUFDLENBQUM7U0FDOUM7UUFDRCxJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztRQUNqQyxJQUFJLENBQUMsdUJBQXVCLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQ3RFLElBQUksQ0FBQyw0QkFBNEIsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUM7UUFDaEYsSUFBSSxDQUFDLG1DQUFtQyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUM5RixJQUFJLENBQUMsc0NBQXNDLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1FBRXBHLHNEQUFzRDtRQUN0RCxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxzQkFBZSxDQUFDLFlBQVksRUFBb0IsQ0FBQyxDQUFDO1FBRXBHLE1BQU0sbUJBQW1CLEdBQUc7WUFDeEIsSUFBSSxFQUFFLFlBQVksQ0FBQyxlQUFlO1lBQ2xDLFdBQVcsRUFBRSxJQUFJLENBQUMsdUNBQXVDLEVBQUU7WUFDM0QsT0FBTyxFQUFFO2dCQUNMLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQzFDLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQzFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUN0RCxpQkFBaUIsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDcEQsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7YUFDM0Q7U0FDSixDQUFDO1FBQ0YsSUFBSSxDQUFDLG1DQUE0QixDQUFDLGFBQWEsRUFBRSxtQ0FBNEIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLEVBQUU7WUFDMUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNwRCxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMzSCxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDO2dCQUNwQyxJQUFJLEVBQUUsc0JBQWUsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFO2dCQUM3QyxJQUFJLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixFQUFFLEVBQUUsRUFBRSxjQUFLLENBQUMsWUFBWSxDQUFDO2FBQzNELENBQUMsQ0FBQztTQUNOO1FBQ0QsWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztRQUM1RCxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksWUFBWSxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVEOzs7T0FHRztJQUNILGNBQWMsQ0FBQyxPQUFlO1FBQzFCLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsS0FBSyxtQ0FBNEIsQ0FBQyxPQUFPLEVBQUU7WUFDN0UsT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFDRCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxZQUFZLENBQUMsT0FBZTtRQUN4QixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxXQUFXLENBQUMsT0FBc0I7UUFDOUIsSUFBSSxDQUFDLENBQUMsbUNBQTRCLENBQUMsZ0JBQWdCLEVBQUUsbUNBQTRCLENBQUMsYUFBYSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtZQUMzSSxNQUFNLElBQUksNkJBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUNuQztRQUNELElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxTQUFTLEdBQUc7WUFDYixVQUFVLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtTQUMxRixDQUFDO1FBQ1QsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3ZCLG1CQUFtQjtRQUNuQixvSUFBb0k7UUFDcEksMkJBQTJCO1FBQzNCLGFBQWE7SUFDakIsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILGlCQUFpQixDQUFDLE9BQXNCLEVBQUUsU0FBdUMsRUFBRSxHQUFHLElBQUk7UUFDdEYsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixLQUFLLG1DQUE0QixDQUFDLG9CQUFvQixFQUFFO1lBQzFGLE1BQU0sSUFBSSw2QkFBVSxDQUFDLG9CQUFvQixDQUFDLENBQUM7U0FDOUM7UUFDRCxxREFBcUQ7UUFDckQsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsRUFBRTtZQUN6RCxzREFBc0Q7WUFDdEQsT0FBTyxJQUFJLENBQUMsbUNBQW1DLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixDQUFDLENBQUM7U0FDcEk7UUFDRCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN2RixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGtCQUFrQixDQUFDLFNBQVMsRUFBRSxHQUFHLElBQUk7UUFDakMsSUFBSSxJQUFJLENBQUMseUJBQXlCLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDM0MsT0FBTztTQUNWO1FBQ0QsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDakUsTUFBTSxtQkFBbUIsR0FBRyxXQUFXLGdCQUFnQixDQUFDLElBQUksUUFBUSxDQUFDO1FBQ3JFLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDRCQUE0QixFQUFFLG1CQUFtQixDQUFDLEVBQUU7WUFDM0YsT0FBTztTQUNWO1FBQ0QsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLElBQUksQ0FBQyw0QkFBNEIsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUN2SyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFlBQVksQ0FBQyxTQUFTLEVBQUUsR0FBRyxJQUFJO1FBQzNCLElBQUksSUFBSSxDQUFDLHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzNDLE9BQU87U0FDVjtRQUNELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sbUJBQW1CLEdBQUcsT0FBTyxnQkFBZ0IsQ0FBQyxJQUFJLFFBQVEsQ0FBQztRQUNqRSx3QkFBd0I7UUFDeEIsSUFBSSxDQUFDLGdCQUFnQixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsbUJBQW1CLENBQUMsRUFBRTtZQUN0RixPQUFPO1NBQ1Y7UUFDRCxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLG1CQUFtQixDQUFDLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3RLLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsWUFBWSxDQUFDLFNBQVMsRUFBRSxHQUFHLElBQUk7UUFDM0IsSUFBSSxJQUFJLENBQUMseUJBQXlCLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDM0MsT0FBTztTQUNWO1FBQ0QsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsK0JBQStCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsRUFBRTtZQUNwTSxJQUFJLENBQUMsdUJBQXVCLEdBQUcsdUJBQXVCLENBQUM7UUFDM0QsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGlCQUFpQixDQUFDLFNBQVM7UUFDdkIsSUFBSSxJQUFJLENBQUMseUJBQXlCLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDM0MsT0FBTztTQUNWO1FBQ0QsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDakUsTUFBTSxtQkFBbUIsR0FBRyxPQUFPLGdCQUFnQixDQUFDLElBQUksUUFBUSxDQUFDO1FBQ2pFLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdkosd0JBQXdCO1FBQ3hCLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxFQUFFLG1CQUFtQixDQUFDLEVBQUU7WUFDckcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1lBQ25ELE9BQU8sWUFBWSxDQUFDO1NBQ3ZCO1FBQ0QsTUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLElBQUksQ0FBQyxzQ0FBc0MsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7UUFDMU8sT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsWUFBWSxFQUFFLG1CQUFtQixDQUFDLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsbUJBQW1CLENBQUMsVUFBVTtRQUMxQixNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sbUJBQW1CLEdBQUcsT0FBTyxnQkFBZ0IsRUFBRSxJQUFJLG9CQUFvQixDQUFDO1FBQzlFLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3pKLE9BQU8sQ0FBQyxHQUFHLENBQUMsOEJBQThCLENBQUMsQ0FBQztRQUM1Qyx3QkFBd0I7UUFDeEIsSUFBSSxDQUFDLGdCQUFnQixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUNBQW1DLEVBQUUsbUJBQW1CLENBQUMsRUFBRTtZQUNsRyxPQUFPLFlBQVksQ0FBQztTQUN2QjtRQUNELE9BQU8sWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDMUIsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLElBQUksQ0FBQyxtQ0FBbUMsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNyTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7O09BR0c7SUFDSCxXQUFXLENBQUMsS0FBVTtRQUNsQixJQUFJLENBQUMsQ0FBQyxLQUFLLFlBQVksZ0NBQWEsQ0FBQyxFQUFFO1lBQ25DLE1BQU0sS0FBSyxDQUFDO1NBQ2Y7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVEOztPQUVHO0lBQ0gseUJBQXlCLENBQUMsU0FBUztRQUMvQixPQUFPLFNBQVMsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLG9CQUFvQixJQUFJLENBQUMsQ0FBQyxtQ0FBNEIsQ0FBQyxhQUFhLEVBQUUsbUNBQTRCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3JNLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsdUNBQXVDO1FBQ25DLE1BQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQztRQUMxQixLQUFLLE1BQU0sQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLEVBQUU7WUFDekcsS0FBSyxNQUFNLFNBQVMsSUFBSSxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUU7Z0JBQ2xELElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFO29CQUNyQixNQUFNLElBQUksS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7aUJBQ3ZDO2dCQUNELElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ2hELGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxTQUFTLENBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQzthQUMxRjtTQUNKO1FBQ0QsT0FBTyxjQUFjLENBQUM7SUFDMUIsQ0FBQztDQUNKO0FBRUQsU0FBZ0IseUJBQXlCLENBQUMsT0FBNEI7SUFDbEUsT0FBTyxDQUFDLFlBQTBCLEVBQXdCLEVBQUU7UUFDeEQsT0FBTyxJQUFJLG9CQUFvQixDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMzRCxDQUFDLENBQUM7QUFDTixDQUFDO0FBSkQsOERBSUM7QUFFRCx3QkFBZSxDQUFDLENBQUM7UUFDYixFQUFFLEVBQUUsMkJBQTJCO1FBQy9CLEtBQUssRUFBRSxXQUFXO1FBQ2xCLFFBQVEsRUFBRSx5QkFBeUI7S0FDdEMsQ0FBQyxDQUFDLENBQUMifQ==