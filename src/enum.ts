/**
 * 合同服务自身事件
 */
export enum ContractEventEnum {
    /**
     * 初始化合同状态机.合同创建完以后,开始异步执行创建具体状态机事件.
     * 该事件会初始化策略声明信息.以及更改合同信息中的状态机相关属性.
     */
    InitialContractFsmEvent = 'InitialContractFsmEvent'
}

/**
 * 合同状态机事件枚举.
 */
export enum ContractFsmEventEnum {

    FsmStateTransition = 'FsmStateTransition'
}

/**
 * A开头的为自然事件,单例执行,例如时间,周期等.
 * S需要主动触发
 */
export enum PolicyEventEnum {

    /**
     * 初始化事件
     */
    InitialEvent = 'init',

    /**
     * 周期结束事件
     */
    EndOfCycleEvent = 'A101',

    /**
     * 绝对时间事件
     * @type {string}
     */
    AbsolutelyTimeEvent = 'A102',

    /**
     * 相对时间事件
     * @type {string}
     */
    RelativeTimeEvent = 'A103',

    /**
     * 交易事件
     */
    TransactionEvent = 'S201'
}

/**
 * 外部其他服务发送的事件
 */
export enum OutsideServiceEventEnum {

    /**
     * 支付中心的支付订单状态改变事件
     */
    PaymentOrderStatusChangedEvent = 'auth#paymentOrderStatusChangedEvent',

    /**
     * 支付中心的支付订单状态改变事件
     */
    TransferRecordTradeStatusChangedEvent = 'auth#transferRecordTradeStatusChangedEvent',

    /**
     * 已注册的事件触发事件
     */
    RegisteredEventTriggerEvent = 'auth#RegisteredEventTriggerEvent',

    /**
     * 支付服务询问是否确认支付事件
     */
    InquirePaymentEvent = 'auth#inquirePaymentEvent',

    /**
     * 支付服务询问是否确认转账事件
     */
    InquireTransferEvent = 'auth#inquireTransferEvent',

    /**
     * 事件注册完成事件
     */
    RegisterCompletedEvent = 'auth#registerCompletedEvent',
}

/**
 * 合约状态机运行状态
 */
export enum ContractFsmRunningStatusEnum {
    /**
     * 未初始化
     */
    Uninitialized = 1,

    /**
     * <del>系统锁定中,例如系统需要一定时间来计算合同内部的数据<del>
     * 等待事件注册. 合同状态流转之后,会进行事件注册操作.如果注册失败,不影响主流程,但是会记录注册的状态.后续通过job继续注册.
     * 处于此状态的合约不能接受新的事件.必须等待事件注册成功之后才可以接受新事件.
     * 合约的锁定改为通过redis分布式锁来实现.主要是考虑到性能以及业务的侵入性以及分布式锁的自动超时等问题.
     * @type {number}
     */
    ToBeRegisteredEvents = 2,

    /**
     * 合同正常运行中
     * @type {number}
     */
    Running = 4,

    /**
     * 合同已终止
     * @type {number}
     */
    Terminated = 8,

    /**
     * 初始化异常
     * @type {number}
     */
    InitializedError = 16
}

/**
 * 授权状态(1:只获得正式授权 2:只获得测试授权 3:获得正式和测试授权 128:未获得授权)
 */
export enum ContractAuthStatusEnum {
    /**
     * 只获得正式授权
     * @type {number}
     */
    Authorized = 1,

    /**
     * 只获得测试授权
     * @type {number}
     */
    TestNodeAuthorized = 2,

    /**
     * 未获得任何授权
     */
    Unauthorized = 128,
}
