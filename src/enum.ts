/**
 * 标的物类型
 */
export enum SubjectType {
    Resource = 1,
    Presentable = 2,
    UserGroup = 3
}

/**
 * 合同类型
 */
export enum ContractType {
    ResourceToResource = 1,
    NodeToResource = 2,
    UserToNode = 3
}

/**
 * 合同服务自身事件
 */
export enum ContractEventEnum {
    /**
     * 初始化合同状态机.合同创建完以后,开始异步执行创建具体状态机事件.
     * 该事件会初始化策略声明信息.以及更改合同信息中的状态机相关属性.
     */
    InitialContractFsmEvent = 'InitialContractFsmEvent',
}

/**
 * 合同状态机事件枚举.
 */
export enum ContractFsmEventEnum {

    FsmStateTransition = 'FsmStateTransition'

}

/**
 * 外部其他服务发送的事件
 */
export enum OutsideServiceEventEnum {

}

export enum ContractFsmRunningStatusEnum {
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

export enum ContractAuthStatusEnum {
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

export enum ContractStatusEnum {
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
