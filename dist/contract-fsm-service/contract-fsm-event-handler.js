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
        if (updateContractModel.fsmRunningStatus === enum_1.ContractFsmRunningStatusEnum.Terminated) {
            updateContractModel.status = 1;
        }
        const transitionRecord = {
            _id: this.mongoose.getNewObjectId(),
            contractId: contractInfo.contractId,
            fromState, toState, eventId: transition, eventInfo
        };
        const task1 = this.contractTransitionRecordProvider.create([transitionRecord], { session });
        const task2 = this.contractInfoProvider.updateOne({ _id: contractInfo.contractId }, updateContractModel, { session });
        await Promise.all([task1, task2]).then(() => {
            console.log(`修改合约状态,contractId:${contractInfo.contractId},from:${fromState},to:${toState}`);
            return this.execAuthStatusChangedEventHandle(contractInfo, updateContractModel.authStatus);
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
     * 合约授权状态发生转变事件处理
     * @param contractInfo
     * @param afterAuthStatus
     */
    async execAuthStatusChangedEventHandle(contractInfo, afterAuthStatus) {
        if (contractInfo.authStatus === afterAuthStatus) {
            return;
        }
        // TODO:发送合约授权状态变更事件
        // topic-name: <subject-type>-contract-auth-status-changed-queue
        // key: contractId (同一个contractId可以保证是顺序处理)
        // msgBody: {
        //     contractId: contractInfo.contractId,
        //     subjectId: contractInfo.subjectId,
        //     subjectName: contractInfo.subjectName,
        //     subjectType: contractInfo.subjectType,
        //     licenseeId: contractInfo.licenseeId,
        //     licenseeOwnerId: contractInfo.licenseeOwnerId,
        //     licensorId: contractInfo.licensorId,
        //     licensorOwnerId: contractInfo.licensorOwnerId,
        //     beforeAuthStatus, afterAuthStatus
        // };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZnNtLWV2ZW50LWhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udHJhY3QtZnNtLXNlcnZpY2UvY29udHJhY3QtZnNtLWV2ZW50LWhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBLGtDQUE4RjtBQUs5Rix1REFBcUY7QUFDckYsbUNBQWlFO0FBRWpFLDJHQUFtRztBQUluRyxJQUFhLHVCQUF1QiwrQkFBcEMsTUFBYSx1QkFBdUI7SUFXaEM7Ozs7Ozs7Ozs7OztPQVlHO0lBQ0gsS0FBSyxDQUFDLCtCQUErQixDQUFDLFlBQTBCLEVBQUUsT0FBc0IsRUFBRSxTQUF1QyxFQUFFLFVBQWtCLEVBQUUsU0FBaUIsRUFBRSxPQUFlO1FBRXJMLE1BQU0sbUJBQW1CLEdBQTBCO1lBQy9DLGVBQWUsRUFBRSxPQUFPO1lBQ3hCLGdCQUFnQixFQUFFLHlCQUF1QixDQUFDLDJCQUEyQixDQUFDLFlBQVksRUFBRSxPQUFPLENBQUM7WUFDNUYsVUFBVSxFQUFFLHlCQUF1QixDQUFDLHFCQUFxQixDQUFDLFlBQVksRUFBRSxPQUFPLENBQUM7WUFDaEYsZUFBZSxFQUFFLFlBQVksQ0FBQyxlQUFlO1NBQ2hELENBQUM7UUFDRixJQUFJLG1CQUFtQixDQUFDLGdCQUFnQixLQUFLLG1DQUE0QixDQUFDLFVBQVUsRUFBRTtZQUNsRixtQkFBbUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1NBQ2xDO1FBQ0QsTUFBTSxnQkFBZ0IsR0FBNkI7WUFDL0MsR0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFO1lBQ25DLFVBQVUsRUFBRSxZQUFZLENBQUMsVUFBVTtZQUNuQyxTQUFTLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUztTQUNyRCxDQUFDO1FBRUYsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLE1BQU0sQ0FBQyxD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