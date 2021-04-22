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
var ContractFsmEventHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractFsmEventHandler = void 0;
const enum_1 = require("../enum");
const egg_freelog_base_1 = require("egg-freelog-base");
const midway_1 = require("midway");
let ContractFsmEventHandler = ContractFsmEventHandler_1 = class ContractFsmEventHandler {
    /**
     * 同步订单状态,并且记录订单变更历史
     * 1.同步合同的授权状态
     * 2.同步状态机的运行状态描述
     * 3.同步状态机的实际执行状态
     * 4.记录状态机变更历史记录
     * @param contractInfo
     * @param session
     * @param eventInfo
     * @param transition
     * @param fromState
     * @param toState
     */
    async syncOrderStateAndChangedHistory(contractInfo, session, eventInfo, transition, fromState, toState) {
        const updateContractModel = {
            fsmCurrentState: toState,
            fsmRunningStatus: ContractFsmEventHandler_1.GetContractFsmRunningStatus(contractInfo, toState),
            authStatus: ContractFsmEventHandler_1.GetContractAuthStatus(contractInfo, toState)
        };
        const transitionRecord = {
            _id: this.mongoose.getNewObjectId(),
            contractId: contractInfo.contractId,
            fromState, toState, eventId: transition, eventInfo
        };
        const task1 = this.contractTransitionRecordProvider.create([transitionRecord], { session });
        const task2 = this.contractInfoProvider.updateOne({ _id: contractInfo.contractId }, updateContractModel, { session });
        await Promise.all([task1, task2]).then(() => {
            console.log(`修改合约状态,contractId:${contractInfo.contractId},from:${fromState},to:${toState}`);
        });
        return transitionRecord._id;
    }
    /**
     * 合约初始化错误处理
     * @param contractInfo
     * @param session
     * @param eventInfo
     * @param errorMsg
     */
    async contractInitialErrorHandle(contractInfo, session, eventInfo, errorMsg) {
        console.log(`合约${contractInfo.contractId}初始化错误,${errorMsg}`);
        return this.contractInfoProvider.updateOne({
            _id: contractInfo.contractId,
            fsmRunningStatus: { $in: [enum_1.ContractFsmRunningStatusEnum.Uninitialized, enum_1.ContractFsmRunningStatusEnum.InitializedError] }
        }, {
            fsmRunningStatus: enum_1.ContractFsmRunningStatusEnum.InitializedError
        }, { session });
    }
    /**
     * 执行初始化操作
     * @param contractInfo
     * @param session
     * @param eventInfo
     */
    async [`exec${enum_1.PolicyEventEnum.InitialEvent}Handle`](contractInfo, session, eventInfo) {
        if (![enum_1.ContractFsmRunningStatusEnum.InitializedError, enum_1.ContractFsmRunningStatusEnum.Uninitialized].includes(contractInfo.fsmRunningStatus)) {
            return;
        }
        // contractInfo.fsmDeclarations.envArgs = {};
        for (const [_, stateDescription] of Object.entries(contractInfo.policyInfo.fsmDescriptionInfo)) {
            for (const [_, eventInfo] of Object.entries(stateDescription.transition ?? {})) {
                if (eventInfo.code === enum_1.PolicyEventEnum.TransactionEvent) {
                    // 此处需要校验账号信息或者赋值环境变量
                }
            }
        }
    }
    /**
     * 获取合同的授权状态
     * @param contractInfo
     * @param toState
     * @constructor
     */
    static GetContractAuthStatus(contractInfo, toState) {
        const currentStateFsmDescriptionInfo = contractInfo.policyInfo.fsmDescriptionInfo[toState];
        if (currentStateFsmDescriptionInfo?.isAuth && currentStateFsmDescriptionInfo?.isTestAuth) {
            return enum_1.ContractAuthStatusEnum.Authorized | enum_1.ContractAuthStatusEnum.TestNodeAuthorized;
        }
        else if (currentStateFsmDescriptionInfo?.isAuth) {
            return enum_1.ContractAuthStatusEnum.Authorized;
        }
        else if (currentStateFsmDescriptionInfo?.isTestAuth) {
            return enum_1.ContractAuthStatusEnum.TestNodeAuthorized;
        }
        else {
            return enum_1.ContractAuthStatusEnum.Unauthorized;
        }
    }
    /**
     * 获取合约的运行状态
     * @param contractInfo
     * @param toState
     * @constructor
     */
    static GetContractFsmRunningStatus(contractInfo, toState) {
        const fsmStateDescriptionInfo = contractInfo.policyInfo.fsmDescriptionInfo[toState];
        if (!fsmStateDescriptionInfo) { // 测试
            return enum_1.ContractFsmRunningStatusEnum.Running;
        }
        // 如果获得授权,或者不是终止态,则属于运行状态
        if (fsmStateDescriptionInfo.isAuth || !fsmStateDescriptionInfo.isTerminate) {
            return enum_1.ContractFsmRunningStatusEnum.Running;
        }
        // 如果已经终止,获得了测试授权,且不是C端消费者合约,则依然属于运行状态
        if (fsmStateDescriptionInfo.isTerminate && fsmStateDescriptionInfo.isTestAuth && contractInfo.licenseeIdentityType !== egg_freelog_base_1.ContractLicenseeIdentityTypeEnum.ClientUser) {
            return enum_1.ContractFsmRunningStatusEnum.Running;
        }
        return enum_1.ContractFsmRunningStatusEnum.Terminated;
    }
};
__decorate([
    midway_1.plugin(),
    __metadata("design:type", Object)
], ContractFsmEventHandler.prototype, "mongoose", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractFsmEventHandler.prototype, "contractInfoProvider", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractFsmEventHandler.prototype, "contractTransitionRecordProvider", void 0);
ContractFsmEventHandler = ContractFsmEventHandler_1 = __decorate([
    midway_1.provide(),
    midway_1.scope(midway_1.ScopeEnum.Singleton)
], ContractFsmEventHandler);
exports.ContractFsmEventHandler = ContractFsmEventHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZnNtLWV2ZW50LWhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udHJhY3QtZnNtLXNlcnZpY2UvY29udHJhY3QtZnNtLWV2ZW50LWhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBLGtDQUE4RjtBQUs5Rix1REFBcUY7QUFDckYsbUNBQWlFO0FBS2pFLElBQWEsdUJBQXVCLCtCQUFwQyxNQUFhLHVCQUF1QjtJQVNoQzs7Ozs7Ozs7Ozs7O09BWUc7SUFDSCxLQUFLLENBQUMsK0JBQStCLENBQUMsWUFBMEIsRUFBRSxPQUFzQixFQUFFLFNBQXVDLEVBQUUsVUFBa0IsRUFBRSxTQUFpQixFQUFFLE9BQWU7UUFDckwsTUFBTSxtQkFBbUIsR0FBMEI7WUFDL0MsZUFBZSxFQUFFLE9BQU87WUFDeEIsZ0JBQWdCLEVBQUUseUJBQXVCLENBQUMsMkJBQTJCLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQztZQUM1RixVQUFVLEVBQUUseUJBQXVCLENBQUMscUJBQXFCLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQztTQUNuRixDQUFDO1FBQ0YsTUFBTSxnQkFBZ0IsR0FBNkI7WUFDL0MsR0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFO1lBQ25DLFVBQVUsRUFBRSxZQUFZLENBQUMsVUFBVTtZQUNuQyxTQUFTLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUztTQUNyRCxDQUFDO1FBRUYsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDO1FBQzFGLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsRUFBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLFVBQVUsRUFBQyxFQUFFLG1CQUFt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