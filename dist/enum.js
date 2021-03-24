"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractCanBeRegisteredEventEnum = exports.ContractAuthStatusEnum = exports.ContractFsmRunningStatusEnum = exports.OutsideServiceEventEnum = exports.ContractFsmEventEnum = exports.ContractEventEnum = void 0;
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
/**
 * 授权状态(1:只获得正式授权 2:只获得测试授权 3:获得正式和测试授权 128:未获得授权)
 */
var ContractAuthStatusEnum;
(function (ContractAuthStatusEnum) {
    /**
     * 只获得正式授权
     * @type {number}
     */
    ContractAuthStatusEnum[ContractAuthStatusEnum["Authorized"] = 1] = "Authorized";
    /**
     * 只获得测试授权
     * @type {number}
     */
    ContractAuthStatusEnum[ContractAuthStatusEnum["TestNodeAuthorized"] = 2] = "TestNodeAuthorized";
    /**
     * 未获得任何授权
     */
    ContractAuthStatusEnum[ContractAuthStatusEnum["Unauthorized"] = 128] = "Unauthorized";
})(ContractAuthStatusEnum = exports.ContractAuthStatusEnum || (exports.ContractAuthStatusEnum = {}));
/**
 * 合约中可被注册的事件枚举
 */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW51bS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9lbnVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBOztHQUVHO0FBQ0gsSUFBWSxpQkFNWDtBQU5ELFdBQVksaUJBQWlCO0lBQ3pCOzs7T0FHRztJQUNILHdFQUFtRCxDQUFBO0FBQ3ZELENBQUMsRUFOVyxpQkFBaUIsR0FBakIseUJBQWlCLEtBQWpCLHlCQUFpQixRQU01QjtBQUVEOztHQUVHO0FBQ0gsSUFBWSxvQkFHWDtBQUhELFdBQVksb0JBQW9CO0lBRTVCLGlFQUF5QyxDQUFBO0FBQzdDLENBQUMsRUFIVyxvQkFBb0IsR0FBcEIsNEJBQW9CLEtBQXBCLDRCQUFvQixRQUcvQjtBQUVEOztHQUVHO0FBQ0gsSUFBWSx1QkErQlg7QUEvQkQsV0FBWSx1QkFBdUI7SUFFL0I7O09BRUc7SUFDSCxpR0FBc0UsQ0FBQTtJQUV0RTs7T0FFRztJQUNILCtHQUFvRixDQUFBO0lBRXBGOztPQUVHO0lBQ0gsMkZBQWdFLENBQUE7SUFFaEU7O09BRUc7SUFDSCwyRUFBZ0QsQ0FBQTtJQUVoRDs7T0FFRztJQUNILDZFQUFrRCxDQUFBO0lBRWxEOztPQUVHO0lBQ0gsaUZBQXNELENBQUE7QUFDMUQsQ0FBQyxFQS9CVyx1QkFBdUIsR0FBdkIsK0JBQXVCLEtBQXZCLCtCQUF1QixRQStCbEM7QUFFRCxJQUFZLDRCQTZCWDtBQTdCRCxXQUFZLDRCQUE0QjtJQUNwQzs7T0FFRztJQUNILGlHQUFpQixDQUFBO0lBRWpCOzs7T0FHRztJQUNILG1GQUFVLENBQUE7SUFFVjs7O09BR0c7SUFDSCxxRkFBVyxDQUFBO0lBRVg7OztPQUdHO0lBQ0gsMkZBQWMsQ0FBQTtJQUVkOzs7T0FHRztJQUNILHdHQUFxQixDQUFBO0FBQ3pCLENBQUMsRUE3QlcsNEJBQTRCLEdBQTVCLG9DQUE0QixLQUE1QixvQ0FBNEIsUUE2QnZDO0FBRUQ7O0dBRUc7QUFDSCxJQUFZLHNCQWlCWDtBQWpCRCxXQUFZLHNCQUFzQjtJQUM5Qjs7O09BR0c7SUFDSCwrRUFBYyxDQUFBO0lBRWQ7OztPQUdHO0lBQ0gsK0ZBQXNCLENBQUE7SUFFdEI7O09BRUc7SUFDSCxxRkFBa0IsQ0FBQTtBQUN0QixDQUFDLEVBakJXLHNCQUFzQixHQUF0Qiw4QkFBc0IsS0FBdEIsOEJBQXNCLFFBaUJqQztBQUVEOztHQUVHO0FBQ0gsSUFBWSxnQ0FrQlg7QUFsQkQsV0FBWSxnQ0FBZ0M7SUFFeEM7O09BRUc7SUFDSCw0REFBd0IsQ0FBQTtJQUV4Qjs7O09BR0c7SUFDSCxzREFBa0IsQ0FBQTtJQUVsQjs7O09BR0c7SUFDSCw4REFBMEIsQ0FBQTtBQUM5QixDQUFDLEVBbEJXLGdDQUFnQyxHQUFoQyx3Q0FBZ0MsS0FBaEMsd0NBQWdDLFFBa0IzQyJ9