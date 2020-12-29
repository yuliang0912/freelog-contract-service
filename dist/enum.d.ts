/**
 * 合同服务自身事件
 */
export declare enum ContractEventEnum {
    /**
     * 初始化合同状态机.合同创建完以后,开始异步执行创建具体状态机事件.
     * 该事件会初始化策略声明信息.以及更改合同信息中的状态机相关属性.
     */
    InitialContractFsmEvent = "InitialContractFsmEvent"
}
/**
 * 合同状态机事件枚举.
 */
export declare enum ContractFsmEventEnum {
    FsmStateTransition = "FsmStateTransition"
}
/**
 * 外部其他服务发送的事件
 */
export declare enum OutsideServiceEventEnum {
    /**
     * 支付中心的支付订单状态改变事件
     */
    PaymentOrderStatusChangedEvent = "auth#paymentOrderStatusChangedEvent",
    /**
     * 支付中心的支付订单状态改变事件
     */
    TransferRecordTradeStatusChangedEvent = "auth#transferRecordTradeStatusChangedEvent",
    /**
     * 已注册的事件触发事件
     */
    RegisteredEventTriggerEvent = "auth#RegisteredEventTriggerEvent",
    /**
     * 支付服务询问是否确认支付事件
     */
    InquirePaymentEvent = "auth#inquirePaymentEvent",
    /**
     * 支付服务询问是否确认转账事件
     */
    InquireTransferEvent = "auth#inquireTransferEvent",
    /**
     * 事件注册完成事件
     */
    RegisterCompletedEvent = "auth#registerCompletedEvent"
}
export declare enum ContractFsmRunningStatusEnum {
    /**
     * 未初始化
     */
    Uninitialized = 1,
    /**
     * 系统锁定中,例如系统需要一定时间来计算合同内部的数据
     * @type {number}
     */
    Locked = 2,
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
 * 授权状态(1:只获得正式授权 2:只获得测试授权 3:获得正式和测试授权 999:未获得授权)
 */
export declare enum ContractAuthStatusEnum {
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
    Unauthorized = 128
}
export declare enum ContractCanBeRegisteredEventEnum {
    /**
     * 周期事件
     */
    EndOfCycleEvent = "A101",
    /**
     * 时间事件
     * @type {string}
     */
    TimeEvent = "A102",
    /**
     * 相对时间事件
     * @type {string}
     */
    RelativeTimeEvent = "A103"
}
