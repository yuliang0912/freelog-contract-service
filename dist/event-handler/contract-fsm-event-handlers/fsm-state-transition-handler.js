"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractFsmStateTransitionHandler = void 0;
const midway_1 = require("midway");
const enum_1 = require("../../enum");
/**
 * 合同状态机状态切换时的业务处理
 */
let ContractFsmStateTransitionHandler = class ContractFsmStateTransitionHandler {
    /**
     * TODO: 前期: 1.合同加锁并且记录合同变更历史(需要事务保证原子性) 2.获取环境变量值 3.计算表达式值
     * TODO: 中期: 1.注册事件到注册中心(幂等性支持) 2.等待事件全部注册成功  2.解锁合同
     * TODO: 后期: 1.修改合同各种状态(如果前置步骤失败了,可以通过job继续触发,所以需要保证合同历史记录中有对应的事件信息)
     * @param {ContractInfo} contractInfo
     * @param {string} fromState
     * @param {string} toState
     * @param currEvent
     * @returns {Promise<void>}
     */
    async handle(contractInfo, fsmDescriptionInfo, fromState, toState, currEvent) {
        if (contractInfo.fsmRunningStatus === enum_1.ContractFsmRunningStatusEnum.Locked) {
            return;
        }
        const eventId = currEvent.eventId;
        console.log(`contract:${contractInfo.contractId} fsm state transition event: from ${fromState} to ${toState} by event [id:${eventId}]`);
        await this._registerAndUnregisterContractEvents(contractInfo, fsmDescriptionInfo);
        await this.contractService.addContractChangedHistory(contractInfo, fromState, toState, eventId, new Date());
        await this.contractService.updateContractInfo(contractInfo, {
            fsmCurrentState: toState, fsmRunningStatus: this._getContractFsmRunningStatus()
        });
    }
    /**
     * 注册当下新状态下的事件,取消其他状态下的事件
     * 实现逻辑:合同服务批量一次性注册当前运行状态下的所有可注册事件.
     * 注册服务批量接收到所有可注册的事件.然后首先删除当前合约ID下的所有已注册事件.然后重新注册新的事件集
     * 区别于上一版本,此版本不再明确发送取消注册的事件
     * @returns {Promise<null>}
     * @private
     */
    async _registerAndUnregisterContractEvents(contractInfo, fsmDescriptionInfo) {
        const contractCanBeRegisteredEvents = this.contractFsmEventAnalysis.getContractCanBeRegisteredEvents(fsmDescriptionInfo, contractInfo.fsmCurrentState);
        if (contractCanBeRegisteredEvents.length) {
            console.log('等待注册的事件数量:' + contractCanBeRegisteredEvents);
        }
        return null;
    }
    /**
     * 分析合同内容,获取合同状态机运行时的状态
     * @returns {Promise<void>}
     * @private
     */
    _getContractFsmRunningStatus() {
        return enum_1.ContractFsmRunningStatusEnum.Running;
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractFsmStateTransitionHandler.prototype, "contractFsmEventAnalysis", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractFsmStateTransitionHandler.prototype, "contractService", void 0);
ContractFsmStateTransitionHandler = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('contractFsmStateTransitionHandler')
], ContractFsmStateTransitionHandler);
exports.ContractFsmStateTransitionHandler = ContractFsmStateTransitionHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnNtLXN0YXRlLXRyYW5zaXRpb24taGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ldmVudC1oYW5kbGVyL2NvbnRyYWN0LWZzbS1ldmVudC1oYW5kbGVycy9mc20tc3RhdGUtdHJhbnNpdGlvbi1oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUE4QztBQUM5QyxxQ0FBd0Q7QUFHeEQ7O0dBRUc7QUFHSCxJQUFhLGlDQUFpQyxHQUE5QyxNQUFhLGlDQUFpQztJQU8xQzs7Ozs7Ozs7O09BU0c7SUFDSCxLQUFLLENBQUMsTUFBTSxDQUFDLFlBQTBCLEVBQUUsa0JBQTBCLEVBQUUsU0FBaUIsRUFBRSxPQUFlLEVBQUUsU0FBYztRQUVuSCxJQUFJLFlBQVksQ0FBQyxnQkFBZ0IsS0FBSyxtQ0FBNEIsQ0FBQyxNQUFNLEVBQUU7WUFDdkUsT0FBTztTQUNWO1FBQ0QsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQztRQUNsQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksWUFBWSxDQUFDLFVBQVUscUNBQXFDLFNBQVMsT0FBTyxPQUFPLGlCQUFpQixPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBRXhJLE1BQU0sSUFBSSxDQUFDLG9DQUFvQyxDQUFDLFlBQVksRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBQ2xGLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyx5QkFBeUIsQ0FBQyxZQUFZLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzVHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUU7WUFDeEQsZUFBZSxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsNEJBQTRCLEVBQUU7U0FDbEYsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxLQUFLLENBQUMsb0NBQW9DLENBQUMsWUFBMEIsRUFBRSxrQkFBMEI7UUFDN0YsTUFBTSw2QkFBNkIsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsZ0NBQWdDLENBQUMsa0JBQWtCLEVBQUUsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3ZKLElBQUksNkJBQTZCLENBQUMsTUFBTSxFQUFFO1lBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxHQUFHLDZCQUE2QixDQUFDLENBQUM7U0FDN0Q7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILDRCQUE0QjtRQUN4QixPQUFPLG1DQUE0QixDQUFDLE9BQU8sQ0FBQztJQUNoRCxDQUFDO0NBQ0osQ0FBQTtBQXJERztJQURDLGVBQU0sRUFBRTs7bUZBQ2dCO0FBRXpCO0lBREMsZUFBTSxFQUFFOzswRUFDeUI7QUFMekIsaUNBQWlDO0lBRjdDLGNBQUssQ0FBQyxXQUFXLENBQUM7SUFDbEIsZ0JBQU8sQ0FBQyxtQ0FBbUMsQ0FBQztHQUNoQyxpQ0FBaUMsQ0F3RDdDO0FBeERZLDhFQUFpQyJ9