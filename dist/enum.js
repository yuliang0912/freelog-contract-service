"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractCanBeRegisteredEventEnum = exports.IdentityTypeEnum = exports.ContractStatusEnum = exports.ContractAuthStatusEnum = exports.ContractFsmRunningStatusEnum = exports.OutsideServiceEventEnum = exports.ContractFsmEventEnum = exports.ContractEventEnum = exports.IdentityType = exports.SubjectType = void 0;
/**
 * 标的物类型
 */
var SubjectType;
(function (SubjectType) {
    SubjectType[SubjectType["Resource"] = 1] = "Resource";
    SubjectType[SubjectType["Presentable"] = 2] = "Presentable";
    SubjectType[SubjectType["UserGroup"] = 3] = "UserGroup";
})(SubjectType = exports.SubjectType || (exports.SubjectType = {}));
/**
 * 身份类型
 */
var IdentityType;
(function (IdentityType) {
    IdentityType[IdentityType["Resource"] = 1] = "Resource";
    IdentityType[IdentityType["Node"] = 2] = "Node";
    IdentityType[IdentityType["ClientUser"] = 3] = "ClientUser";
})(IdentityType = exports.IdentityType || (exports.IdentityType = {}));
/**
 * 合同服务自身事件
 */
var ContractEventEnum;
(function (ContractEventEnum) {
    /**
     * 初始化合同状态机.合同创建完以后,开始异步执行创建具体状态机事件.
     * 该事件会初始化策略声明信息.以及更改合同信息中的状态机相关属性.
     */
    ContractEventEnum["InitialContractFsmEvent"] = "InitialContractFsmEvent";
    ContractEventEnum["SetContractAuthStatusEvent"] = "SetContractAuthStatusEvent";
})(ContractEventEnum = exports.ContractEventEnum || (exports.ContractEventEnum = {}));
/**
 * 合同状态机事件枚举.
 */
var ContractFsmEventEnum;
(function (ContractFsmEventEnum) {
    ContractFsmEventEnum["FsmStateTransition"] = "FsmStateTransition";
})(ContractFsmEventEnum = exports.ContractFsmEventEnum || (exports.ContractFsmEventEnum = {}));
/**
 * 外部其他服务发送的事件
 */
var OutsideServiceEventEnum;
(function (OutsideServiceEventEnum) {
    /**
     * 支付中心的支付订单状态改变事件
     */
    OutsideServiceEventEnum["PaymentOrderStatusChangedEvent"] = "auth#paymentOrderStatusChangedEvent";
    /**
     * 支付中心的支付订单状态改变事件
     */
    OutsideServiceEventEnum["TransferRecordTradeStatusChangedEvent"] = "auth#transferRecordTradeStatusChangedEvent";
    /**
     * 已注册的事件触发事件
     */
    OutsideServiceEventEnum["RegisteredEventTriggerEvent"] = "auth#RegisteredEventTriggerEvent";
    /**
     * 支付服务询问是否确认支付事件
     */
    OutsideServiceEventEnum["InquirePaymentEvent"] = "auth#inquirePaymentEvent";
    /**
     * 支付服务询问是否确认转账事件
     */
    OutsideServiceEventEnum["InquireTransferEvent"] = "auth#inquireTransferEvent";
    /**
     * 事件注册完成事件
     */
    OutsideServiceEventEnum["RegisterCompletedEvent"] = "auth#registerCompletedEvent";
})(OutsideServiceEventEnum = exports.OutsideServiceEventEnum || (exports.OutsideServiceEventEnum = {}));
var ContractFsmRunningStatusEnum;
(function (ContractFsmRunningStatusEnum) {
    /**
     * 未初始化
     */
    ContractFsmRunningStatusEnum[ContractFsmRunningStatusEnum["Uninitialized"] = 1] = "Uninitialized";
    /**
     * 系统锁定中,例如系统需要一定时间来计算合同内部的数据
     * @type {number}
     */
    ContractFsmRunningStatusEnum[ContractFsmRunningStatusEnum["Locked"] = 2] = "Locked";
    /**
     * 合同正常运行中
     * @type {number}
     */
    ContractFsmRunningStatusEnum[ContractFsmRunningStatusEnum["Running"] = 4] = "Running";
    /**
     * 合同已终止
     * @type {number}
     */
    ContractFsmRunningStatusEnum[ContractFsmRunningStatusEnum["Terminated"] = 8] = "Terminated";
    /**
     * 初始化异常
     * @type {number}
     */
    ContractFsmRunningStatusEnum[ContractFsmRunningStatusEnum["InitializedError"] = 16] = "InitializedError";
})(ContractFsmRunningStatusEnum = exports.ContractFsmRunningStatusEnum || (exports.ContractFsmRunningStatusEnum = {}));
var ContractAuthStatusEnum;
(function (ContractAuthStatusEnum) {
    /**
     * 未授权
     */
    ContractAuthStatusEnum[ContractAuthStatusEnum["Unauthorized"] = 1] = "Unauthorized";
    /**
     * 已获得正式授权
     * @type {number}
     */
    ContractAuthStatusEnum[ContractAuthStatusEnum["Authorized"] = 2] = "Authorized";
    /**
     * 只获得测试授权
     * @type {number}
     */
    ContractAuthStatusEnum[ContractAuthStatusEnum["TestNodeAuthorized"] = 4] = "TestNodeAuthorized";
    /**
     * 未知,需要再次调用标的物服务进行授权结果
     * @type {number}
     */
    ContractAuthStatusEnum[ContractAuthStatusEnum["Unknown"] = 8] = "Unknown";
})(ContractAuthStatusEnum = exports.ContractAuthStatusEnum || (exports.ContractAuthStatusEnum = {}));
var ContractStatusEnum;
(function (ContractStatusEnum) {
    /**
     * 正常生效中
     */
    ContractStatusEnum[ContractStatusEnum["Executed"] = 0] = "Executed";
    /**
     * 合同已终止(未授权,并且不再接受新事件)
     * @type {number}
     */
    ContractStatusEnum[ContractStatusEnum["Terminated"] = 1] = "Terminated";
    /**
     * 异常的,例如签名不对,冻结等.
     * @type {number}
     */
    ContractStatusEnum[ContractStatusEnum["Exception"] = 2] = "Exception";
})(ContractStatusEnum = exports.ContractStatusEnum || (exports.ContractStatusEnum = {}));
var IdentityTypeEnum;
(function (IdentityTypeEnum) {
    /**
     * 甲方
     */
    IdentityTypeEnum[IdentityTypeEnum["Licensor"] = 1] = "Licensor";
    /**
     * 乙方
     * @type {number}
     */
    IdentityTypeEnum[IdentityTypeEnum["Licensee"] = 2] = "Licensee";
})(IdentityTypeEnum = exports.IdentityTypeEnum || (exports.IdentityTypeEnum = {}));
var ContractCanBeRegisteredEventEnum;
(function (ContractCanBeRegisteredEventEnum) {
    /**
     * 周期事件
     */
    ContractCanBeRegisteredEventEnum["EndOfCycleEvent"] = "A101";
    /**
     * 时间事件
     * @type {string}
     */
    ContractCanBeRegisteredEventEnum["TimeEvent"] = "A102";
    /**
     * 相对时间事件
     * @type {string}
     */
    ContractCanBeRegisteredEventEnum["RelativeTimeEvent"] = "A103";
})(ContractCanBeRegisteredEventEnum = exports.ContractCanBeRegisteredEventEnum || (exports.ContractCanBeRegisteredEventEnum = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW51bS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9lbnVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBOztHQUVHO0FBQ0gsSUFBWSxXQUlYO0FBSkQsV0FBWSxXQUFXO0lBQ25CLHFEQUFZLENBQUE7SUFDWiwyREFBZSxDQUFBO0lBQ2YsdURBQWEsQ0FBQTtBQUNqQixDQUFDLEVBSlcsV0FBVyxHQUFYLG1CQUFXLEtBQVgsbUJBQVcsUUFJdEI7QUFFRDs7R0FFRztBQUNILElBQVksWUFJWDtBQUpELFdBQVksWUFBWTtJQUNwQix1REFBWSxDQUFBO0lBQ1osK0NBQUksQ0FBQTtJQUNKLDJEQUFVLENBQUE7QUFDZCxDQUFDLEVBSlcsWUFBWSxHQUFaLG9CQUFZLEtBQVosb0JBQVksUUFJdkI7QUFFRDs7R0FFRztBQUNILElBQVksaUJBUVg7QUFSRCxXQUFZLGlCQUFpQjtJQUN6Qjs7O09BR0c7SUFDSCx3RUFBbUQsQ0FBQTtJQUVuRCw4RUFBeUQsQ0FBQTtBQUM3RCxDQUFDLEVBUlcsaUJBQWlCLEdBQWpCLHlCQUFpQixLQUFqQix5QkFBaUIsUUFRNUI7QUFFRDs7R0FFRztBQUNILElBQVksb0JBSVg7QUFKRCxXQUFZLG9CQUFvQjtJQUU1QixpRUFBeUMsQ0FBQTtBQUU3QyxDQUFDLEVBSlcsb0JBQW9CLEdBQXBCLDRCQUFvQixLQUFwQiw0QkFBb0IsUUFJL0I7QUFFRDs7R0FFRztBQUNILElBQVksdUJBK0JYO0FBL0JELFdBQVksdUJBQXVCO0lBRS9COztPQUVHO0lBQ0gsaUdBQXNFLENBQUE7SUFFdEU7O09BRUc7SUFDSCwrR0FBb0YsQ0FBQTtJQUVwRjs7T0FFRztJQUNILDJGQUFnRSxDQUFBO0lBRWhFOztPQUVHO0lBQ0gsMkVBQWdELENBQUE7SUFFaEQ7O09BRUc7SUFDSCw2RUFBa0QsQ0FBQTtJQUVsRDs7T0FFRztJQUNILGlGQUFzRCxDQUFBO0FBQzFELENBQUMsRUEvQlcsdUJBQXVCLEdBQXZCLCtCQUF1QixLQUF2QiwrQkFBdUIsUUErQmxDO0FBRUQsSUFBWSw0QkE2Qlg7QUE3QkQsV0FBWSw0QkFBNEI7SUFDcEM7O09BRUc7SUFDSCxpR0FBaUIsQ0FBQTtJQUVqQjs7O09BR0c7SUFDSCxtRkFBVSxDQUFBO0lBRVY7OztPQUdHO0lBQ0gscUZBQVcsQ0FBQTtJQUVYOzs7T0FHRztJQUNILDJGQUFjLENBQUE7SUFFZDs7O09BR0c7SUFDSCx3R0FBcUIsQ0FBQTtBQUN6QixDQUFDLEVBN0JXLDRCQUE0QixHQUE1QixvQ0FBNEIsS0FBNUIsb0NBQTRCLFFBNkJ2QztBQUVELElBQVksc0JBdUJYO0FBdkJELFdBQVksc0JBQXNCO0lBQzlCOztPQUVHO0lBQ0gsbUZBQWdCLENBQUE7SUFFaEI7OztPQUdHO0lBQ0gsK0VBQWMsQ0FBQTtJQUVkOzs7T0FHRztJQUNILCtGQUFzQixDQUFBO0lBRXRCOzs7T0FHRztJQUNILHlFQUFXLENBQUE7QUFDZixDQUFDLEVBdkJXLHNCQUFzQixHQUF0Qiw4QkFBc0IsS0FBdEIsOEJBQXNCLFFBdUJqQztBQUVELElBQVksa0JBaUJYO0FBakJELFdBQVksa0JBQWtCO0lBQzFCOztPQUVHO0lBQ0gsbUVBQVksQ0FBQTtJQUVaOzs7T0FHRztJQUNILHVFQUFjLENBQUE7SUFFZDs7O09BR0c7SUFDSCxxRUFBYSxDQUFBO0FBQ2pCLENBQUMsRUFqQlcsa0JBQWtCLEdBQWxCLDBCQUFrQixLQUFsQiwwQkFBa0IsUUFpQjdCO0FBRUQsSUFBWSxnQkFZWDtBQVpELFdBQVksZ0JBQWdCO0lBRXhCOztPQUVHO0lBQ0gsK0RBQVksQ0FBQTtJQUVaOzs7T0FHRztJQUNILCtEQUFZLENBQUE7QUFDaEIsQ0FBQyxFQVpXLGdCQUFnQixHQUFoQix3QkFBZ0IsS0FBaEIsd0JBQWdCLFFBWTNCO0FBRUQsSUFBWSxnQ0FrQlg7QUFsQkQsV0FBWSxnQ0FBZ0M7SUFFeEM7O09BRUc7SUFDSCw0REFBd0IsQ0FBQTtJQUV4Qjs7O09BR0c7SUFDSCxzREFBa0IsQ0FBQTtJQUVsQjs7O09BR0c7SUFDSCw4REFBMEIsQ0FBQTtBQUM5QixDQUFDLEVBbEJXLGdDQUFnQyxHQUFoQyx3Q0FBZ0MsS0FBaEMsd0NBQWdDLFFBa0IzQyJ9