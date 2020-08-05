/**
 * 标的物类型
 */
export declare enum SubjectType {
    Resource = 1,
    Presentable = 2,
    UserGroup = 3
}
/**
 * 身份类型
 */
export declare enum IdentityType {
    Resource = 1,
    Node = 2,
    ClientUser = 3
}
/**
 * 合同服务自身事件
 */
export declare enum ContractEventEnum {
    /**
     * 初始化合同状态机.合同创建完以后,开始异步执行创建具体状态机事件.
     * 该事件会初始化策略声明信息.以及更改合同信息中的状态机相关属性.
     */
    InitialContractFsmEvent = "InitialContractFsmEvent",
    SetContractAuthStatusEvent = "SetContractAuthStatusEvent"
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
export declare enum ContractAuthStatusEnum {
    /**
     * 未授权
     */
    Unauthorized = 1,
    /**
     * 已获得正式授权
     * @type {number}
     */
    Authorized = 2,
    /**
     * 只获得测试授权
     * @type {number}
     */
    TestNodeAuthorized = 4,
    /**
     * 未知,需要再次调用标的物服务进行授权结果
     * @type {number}
     */
    Unknown = 8
}
export declare enum ContractStatusEnum {
    /**
     * 正常生效中
     */
    Executed = 0,
    /**
     * 合同已终止(未授权,并且不再接受新事件)
     * @type {number}
     */
    Terminated = 1,
    /**
     * 异常的,例如签名不对,冻结等.
     * @type {number}
     */
    Exception = 2
}
export declare enum IdentityTypeEnum {
    /**
     * 甲方
     */
    Licensor = 1,
    /**
     * 乙方
     * @type {number}
     */
    Licensee = 2
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
