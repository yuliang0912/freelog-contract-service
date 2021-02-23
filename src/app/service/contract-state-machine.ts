import * as StateMachine from 'javascript-state-machine';
import * as StateMachineHistory from 'javascript-state-machine/lib/history';
import {provide, scope} from 'midway';
import {forIn} from 'lodash'
import {FreelogContext, LogicError} from "egg-freelog-base";
import {ContractInfo, PolicyInfo} from "../../interface";
import {ContractChangedHistoryModel} from "../../model/contract-changed-history";
import {ContractPolicyEventEnum} from '../../enum';

/**
 * 合同状态机这一块设计思路:(2021-02-22)
 * 1.事件的发起源分为两种.
 * a.自然事件,此事件不受人为触发影响,又系统指定服务触发, 例如时间或周期事件. 或者数据监听事件,如消费次数达到500
 * b.人为主动式触发事件,例如签约,付款等.
 * 2.如果是自然事件,则走消息队列全程异步操作. 如果是人为事件为了用户体验,则直接同步等待.同步等待的执行过程中,合约属于锁定状态.无法接受外部其他事件
 * 3.合约的状态机部分只解析规则(动态根据策略生成状态机的流转数据).事件相关的操作在其他模块完成.合同事件的每一次发起都需要做事务操作.
 * 4.合同事件执行分为预处理,状态机执行,状态机事件处理三大块. 其中预处理作为整个事件服务的入口,其他两块对外不可直接调用.
 */
/**
 * https://github.com/jakesgordon/javascript-state-machine/blob/master/docs/lifecycle-events.md
 */
@provide()
@scope('Prototype')
export class OrderStateMachine {

    // 初始化时传递的
    ctx: FreelogContext;
    fsm: StateMachine;
    contractInfo: ContractInfo;
    contractPolicyInfo: PolicyInfo;

    /**
     * 是否可以执行指定事件
     * @param contractPolicyEventEnum
     */
    isCanExecEvent(contractPolicyEventEnum: ContractPolicyEventEnum) {
        return this.fsm.can(ContractPolicyEventEnum[contractPolicyEventEnum]);
    }

    /**
     * 进入状态之后执行的事件(此函数主要用来记录状态变更记录)
     * @param lifeCycle
     * @param manager
     * @param orderEventEnum
     * @param args
     */
    onEnterState(lifeCycle, manager: EntityManager, contractPolicyEventEnum: ContractPolicyEventEnum, ...args) {
        if (this._isInitEvent(lifeCycle)) {
            return;
        }
        const changeHistory: Partial<ContractChangedHistoryModel> = {};
        // if ([OrderEventEnum.pickContainerEvent, OrderEventEnum.arrivedVenueEvent, OrderEventEnum.leftVenueEvent, OrderEventEnum.returnContainerEvent, OrderEventEnum.enterStorageYardAuditPassEvent, OrderEventEnum.outStorageYardAuditPassEvent].includes(orderEventEnum) && isDate(last(args))) {
        //     changeHistory.operatorDate = last(args);
        // }
        // return this.orderEventHandlerService.syncOrderStatus(manager, changeHistory)
    }

    /**
     * 调用事件时,执行对应的操作
     * @param lifeCycle
     * @param manager
     * @param orderEventEnum
     * @param args
     */
    onTransition(lifeCycle, contractPolicyEventEnum: ContractPolicyEventEnum, ...args) {
        const eventHandleFuncName = `${lifeCycle.transition}Handle`;
        // 如果事件不需要单独处理,则默认返回true
        if (this._isInitEvent(lifeCycle) || !Reflect.has({}, eventHandleFuncName)) {
            return true;
        }
    }

    /**
     * 初始化
     * @param ctx
     * @param contractInfo
     */
    initial(ctx: FreelogContext, contractInfo: ContractInfo, contractPolicyInfo: PolicyInfo) {
        if (this.contractInfo) {
            throw new LogicError('重复初始化状态机');
        }
        this.ctx = ctx;
        this.contractInfo = contractInfo;

        this.fsm = new StateMachine({
            init: contractInfo.fsmCurrentState,
            transitions: this._fsmDescriptionInfoWarpToFsmTransitions(),
            data: {contractInfo},
            methods: {
                onEnterState: this.onEnterState.bind(this),
                onTransition: this.onTransition.bind(this)
            },
            plugins: [
                new StateMachineHistory()
            ]
        });
        return this;
    }

    /***
     * 是否是状态机默认的空状态到初始化状态转变
     * @param lifeCycle
     */
    _isInitEvent(lifeCycle) {
        return lifeCycle.from === 'none';
    }

    /**
     * 状态机描述对象转换成事件集
     * @returns {any[]}
     * @private
     */
    _fsmDescriptionInfoWarpToFsmTransitions() {
        const fsmTransitions = [];
        forIn(this.contractPolicyInfo.fsmDescriptionInfo, (stateDescription, stateName) => {
            forIn(stateDescription.transition, (eventInfo, nextStateName) => {
                if (eventInfo) {
                    if (!eventInfo.eventId) {
                        throw new Error('策略对象存在异常,不存在事件ID');
                    }
                    fsmTransitions.push({name: eventInfo.eventId, from: stateName, to: nextStateName});
                }
            });
        });
        return fsmTransitions;
    }
}
