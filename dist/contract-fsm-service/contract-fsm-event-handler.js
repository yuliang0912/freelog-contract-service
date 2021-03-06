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
const contract_environment_variable_handler_1 = require("../extend/contract-environment-variable-handler");
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
            authStatus: ContractFsmEventHandler_1.GetContractAuthStatus(contractInfo, toState),
            fsmDeclarations: contractInfo.fsmDeclarations
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
     * @param eventInfo
     * @param errorMsg
     */
    async contractInitialErrorHandle(contractInfo, eventInfo, errorMsg) {
        console.log(`合约${contractInfo.contractId}初始化错误,${errorMsg}`);
        return this.contractInfoProvider.updateOne({
            _id: contractInfo.contractId,
            fsmRunningStatus: { $in: [enum_1.ContractFsmRunningStatusEnum.Uninitialized, enum_1.ContractFsmRunningStatusEnum.InitializedError] }
        }, {
            fsmRunningStatus: enum_1.ContractFsmRunningStatusEnum.InitializedError
        });
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
        // 初始化静态全局环境变量
        await this.contractEnvironmentVariableHandler.initialStaticEnvironmentVariable(contractInfo);
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
__decorate([
    midway_1.inject(),
    __metadata("design:type", contract_environment_variable_handler_1.ContractEnvironmentVariableHandler)
], ContractFsmEventHandler.prototype, "contractEnvironmentVariableHandler", void 0);
ContractFsmEventHandler = ContractFsmEventHandler_1 = __decorate([
    midway_1.provide(),
    midway_1.scope(midway_1.ScopeEnum.Singleton)
], ContractFsmEventHandler);
exports.ContractFsmEventHandler = ContractFsmEventHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZnNtLWV2ZW50LWhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udHJhY3QtZnNtLXNlcnZpY2UvY29udHJhY3QtZnNtLWV2ZW50LWhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBLGtDQUE4RjtBQUs5Rix1REFBcUY7QUFDckYsbUNBQWlFO0FBRWpFLDJHQUFtRztBQUluRyxJQUFhLHVCQUF1QiwrQkFBcEMsTUFBYSx1QkFBdUI7SUFXaEM7Ozs7Ozs7Ozs7OztPQVlHO0lBQ0gsS0FBSyxDQUFDLCtCQUErQixDQUFDLFlBQTBCLEVBQUUsT0FBc0IsRUFBRSxTQUF1QyxFQUFFLFVBQWtCLEVBQUUsU0FBaUIsRUFBRSxPQUFlO1FBRXJMLE1BQU0sbUJBQW1CLEdBQTBCO1lBQy9DLGVBQWUsRUFBRSxPQUFPO1lBQ3hCLGdCQUFnQixFQUFFLHlCQUF1QixDQUFDLDJCQUEyQixDQUFDLFlBQVksRUFBRSxPQUFPLENBQUM7WUFDNUYsVUFBVSxFQUFFLHlCQUF1QixDQUFDLHFCQUFxQixDQUFDLFlBQVksRUFBRSxPQUFPLENBQUM7WUFDaEYsZUFBZSxFQUFFLFlBQVksQ0FBQyxlQUFlO1NBQ2hELENBQUM7UUFDRixNQUFNLGdCQUFnQixHQUE2QjtZQUMvQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUU7WUFDbkMsVUFBVSxFQUFFLFlBQVksQ0FBQyxVQUFVO1lBQ25DLFNBQVMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTO1NBQ3JELENBQUM7UUFFRixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsTUFBTSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUM7UUFDMUYsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxF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