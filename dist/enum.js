"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractAuthStatusEnum = exports.ContractFsmRunningStatusEnum = exports.OutsideServiceEventEnum = exports.PolicyEventEnum = exports.ContractFsmEventEnum = exports.ContractEventEnum = void 0;
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
 * A开头的为自然事件,单例执行,例如时间,周期等.
 * S需要主动触发
 * 详细的事件code与定义参考:https://github.com/freelogfe/freelog_event_definition/blob/master/event_def.csv
 */
var PolicyEventEnum;
(function (PolicyEventEnum) {
    /**
     * 初始化事件
     */
    PolicyEventEnum["InitialEvent"] = "init";
    /**
     * 周期结束事件
     */
    PolicyEventEnum["EndOfCycleEvent"] = "A101";
    /**
     * 绝对时间事件
     * @type {string}
     */
    PolicyEventEnum["AbsolutelyTimeEvent"] = "A102";
    /**
     * 相对时间事件
     * @type {string}
     */
    PolicyEventEnum["RelativeTimeEvent"] = "A103";
    /**
     * 交易事件
     */
    PolicyEventEnum["TransactionEvent"] = "S201";
})(PolicyEventEnum = exports.PolicyEventEnum || (exports.PolicyEventEnum = {}));
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
/**
 * 合约状态机运行状态
 */
var ContractFsmRunningStatusEnum;
(function (ContractFsmRunningStatusEnum) {
    /**
     * 未初始化
     */
    ContractFsmRunningStatusEnum[ContractFsmRunningStatusEnum["Uninitialized"] = 1] = "Uninitialized";
    /**
     * <del>系统锁定中,例如系统需要一定时间来计算合同内部的数据<del>
     * 等待事件注册. 合同状态流转之后,会进行事件注册操作.如果注册失败,不影响主流程,但是会记录注册的状态.后续通过job继续注册.
     * 处于此状态的合约不能接受新的事件.必须等待事件注册成功之后才可以接受新事件.
     * 合约的锁定改为通过redis分布式锁来实现.主要是考虑到性能以及业务的侵入性以及分布式锁的自动超时等问题.
     * @type {number}
     */
    ContractFsmRunningStatusEnum[ContractFsmRunningStatusEnum["ToBeRegisteredEvents"] = 2] = "ToBeRegisteredEvents";
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
     * 用户组标签
     */
    ContractAuthStatusEnum[ContractAuthStatusEnum["Label"] = 4] = "Label";
    /**
     * 未获得任何授权
     */
    ContractAuthStatusEnum[ContractAuthStatusEnum["Unauthorized"] = 128] = "Unauthorized";
})(ContractAuthStatusEnum = exports.ContractAuthStatusEnum || (exports.ContractAuthStatusEnum = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW51bS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9lbnVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBOztHQUVHO0FBQ0gsSUFBWSxpQkFNWDtBQU5ELFdBQVksaUJBQWlCO0lBQ3pCOzs7T0FHRztJQUNILHdFQUFtRCxDQUFBO0FBQ3ZELENBQUMsRUFOVyxpQkFBaUIsR0FBakIseUJBQWlCLEtBQWpCLHlCQUFpQixRQU01QjtBQUVEOztHQUVHO0FBQ0gsSUFBWSxvQkFHWDtBQUhELFdBQVksb0JBQW9CO0lBRTVCLGlFQUF5QyxDQUFBO0FBQzdDLENBQUMsRUFIVyxvQkFBb0IsR0FBcEIsNEJBQW9CLEtBQXBCLDRCQUFvQixRQUcvQjtBQUVEOzs7O0dBSUc7QUFDSCxJQUFZLGVBNEJYO0FBNUJELFdBQVksZUFBZTtJQUV2Qjs7T0FFRztJQUNILHdDQUFxQixDQUFBO0lBRXJCOztPQUVHO0lBQ0gsMkNBQXdCLENBQUE7SUFFeEI7OztPQUdHO0lBQ0gsK0NBQTRCLENBQUE7SUFFNUI7OztPQUdHO0lBQ0gsNkNBQTBCLENBQUE7SUFFMUI7O09BRUc7SUFDSCw0Q0FBeUIsQ0FBQTtBQUM3QixDQUFDLEVBNUJXLGVBQWUsR0FBZix1QkFBZSxLQUFmLHVCQUFlLFFBNEIxQjtBQUVEOztHQUVHO0FBQ0gsSUFBWSx1QkErQlg7QUEvQkQsV0FBWSx1QkFBdUI7SUFFL0I7O09BRUc7SUFDSCxpR0FBc0UsQ0FBQTtJQUV0RTs7T0FFRztJQUNILCtHQUFvRixDQUFBO0lBRXBGOztPQUVHO0lBQ0gsMkZBQWdFLENBQUE7SUFFaEU7O09BRUc7SUFDSCwyRUFBZ0QsQ0FBQTtJQUVoRDs7T0FFRztJQUNILDZFQUFrRCxDQUFBO0lBRWxEOztPQUVHO0lBQ0gsaUZBQXNELENBQUE7QUFDMUQsQ0FBQyxFQS9CVyx1QkFBdUIsR0FBdkIsK0JBQXVCLEtBQXZCLCtCQUF1QixRQStCbEM7QUFFRDs7R0FFRztBQUNILElBQVksNEJBZ0NYO0FBaENELFdBQVksNEJBQTRCO0lBQ3BDOztPQUVHO0lBQ0gsaUdBQWlCLENBQUE7SUFFakI7Ozs7OztPQU1HO0lBQ0gsK0dBQXdCLENBQUE7SUFFeEI7OztPQUdHO0lBQ0gscUZBQVcsQ0FBQTtJQUVYOzs7T0FHRztJQUNILDJGQUFjLENBQUE7SUFFZDs7O09BR0c7SUFDSCx3R0FBcUIsQ0FBQTtBQUN6QixDQUFDLEVBaENXLDRCQUE0QixHQUE1QixvQ0FBNEIsS0FBNUIsb0NBQTRCLFFBZ0N2QztBQUVEOztHQUVHO0FBQ0gsSUFBWSxzQkFzQlg7QUF0QkQsV0FBWSxzQkFBc0I7SUFDOUI7OztPQUdHO0lBQ0gsK0VBQWMsQ0FBQTtJQUVkOzs7T0FHRztJQUNILCtGQUFzQixDQUFBO0lBRXRCOztPQUVHO0lBQ0gscUVBQVMsQ0FBQTtJQUVUOztPQUVHO0lBQ0gscUZBQWtCLENBQUE7QUFDdEIsQ0FBQyxFQXRCVyxzQkFBc0IsR0FBdEIsOEJBQXNCLEtBQXRCLDhCQUFzQixRQXNCakMifQ==