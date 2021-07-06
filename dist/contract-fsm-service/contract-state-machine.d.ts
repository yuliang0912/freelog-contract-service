import { ClientSession } from 'mongoose';
import * as StateMachine from 'javascript-state-machine';
import { IApplicationContext } from 'midway';
import { ContractFsmEventHandler } from './contract-fsm-event-handler';
import { ContractFsmEventPretreatment } from './contract-fsm-event-pretreatment';
import { ContractFsmEventTransitionAfterHandler } from './contract-fsm-event-transition-after-handler';
import { ContractInfo, IContractStateMachine, IContractTriggerEventMessage, PolicyEventInfo } from '../interface';
import { ContractFsmInvalidTransitionHandler } from './contract-fsm-invalid-transition-handler';
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
declare class ContractStateMachine implements IContractStateMachine {
    fsm: StateMachine;
    contractInfo: ContractInfo;
    fromInitialStateName: string;
    eventMap: Map<string, PolicyEventInfo>;
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
    constructor(contractInfo: ContractInfo, context: IApplicationContext);
    /**
     * 是否可以执行指定事件
     * @param eventId
     */
    isCanExecEvent(eventId: string): any;
    /**
     * 获取事件信息
     * @param eventId
     */
    getEventInfo(eventId: string): PolicyEventInfo;
    /**
     * 初始化合约
     * @param session
     */
    execInitial(session: ClientSession): any;
    /**
     * 执行合约事件(后面需要传递事务句柄.所有的数据操作都在事务句柄上完成,任意的异常都会导致事务回滚.事件执行异常)
     * 异常需要加上特定的错误码.然后根据错误码来确定是逻辑问题还是系统问题.若是系统问题,则需要发起重试
     * @param session
     * @param eventInfo
     * @param args (不同事件会有不同的参数体系,只需要原样传递,由专门的事件处理函数来负责特定的业务)
     */
    execContractEvent(session: ClientSession, eventInfo: IContractTriggerEventMessage, ...args: any[]): any;
    /**
     * 进入状态之前做的操作,例如初始化合约.交易验证等
     * @param lifeCycle
     * @param args
     */
    onBeforeTransition(lifeCycle: any, ...args: any[]): any;
    /**
     * 调用事件时,执行对应的操作
     * @param lifeCycle
     * @param args
     */
    onTransition(lifeCycle: any, ...args: any[]): any;
    /**
     * 进入状态之后执行的事件(此函数主要用来记录状态变更记录)
     * @param lifeCycle
     * @param args
     */
    onEnterState(lifeCycle: any, ...args: any[]): Promise<void>;
    /**
     * 状态流转之后(此处做事件注册和取消注册)
     * 事件注册作为流程的最后一步,是因为注册不是使用的事务(mq),需要前面的流程保证能够正确执行完成.
     * @param lifeCycle
     */
    onAfterTransition(lifeCycle: any): Promise<void> | Promise<[void, any]>;
    /**
     * 无效的事件处理
     * @param transition
     */
    onInvalidTransition(transition: any): Promise<any>;
    /**
     * 错误处理
     * @param error
     */
    errorHandle(error: any): void;
    /**
     * 是否无效的状态流转
     */
    _isInvalidStateTransition(lifeCycle: any): boolean;
    /**
     * 状态机描述对象转换成事件集
     * @returns {any[]}
     * @private
     */
    _fsmDescriptionInfoWarpToFsmTransitions(): any[];
}
export declare function buildContractStateMachine(context: IApplicationContext): (contractInfo: ContractInfo) => ContractStateMachine;
export {};
