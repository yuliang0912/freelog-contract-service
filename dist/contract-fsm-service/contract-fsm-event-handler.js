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
const contract_info_signature_generator_1 = require("../extend/contract-common-generator/contract-info-signature-generator");
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
            updateContractModel.uniqueKey = this.contractInfoSignatureProvider.contractBaseInfoUniqueKeyGenerate({
                subjectId: contractInfo.subjectId, subjectType: contractInfo.subjectType,
                licenseeId: contractInfo.licenseeId, policyId: contractInfo.policyId,
                status: 1, contractId: contractInfo.contractId
            });
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
__decorate([
    midway_1.inject(),
    __metadata("design:type", contract_info_signature_generator_1.ContractInfoSignatureProvider)
], ContractFsmEventHandler.prototype, "contractInfoSignatureProvider", void 0);
ContractFsmEventHandler = ContractFsmEventHandler_1 = __decorate([
    midway_1.provide(),
    midway_1.scope(midway_1.ScopeEnum.Singleton)
], ContractFsmEventHandler);
exports.ContractFsmEventHandler = ContractFsmEventHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZnNtLWV2ZW50LWhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udHJhY3QtZnNtLXNlcnZpY2UvY29udHJhY3QtZnNtLWV2ZW50LWhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBLGtDQUE4RjtBQUs5Rix1REFBcUY7QUFDckYsbUNBQWlFO0FBRWpFLDJHQUFtRztBQUNuRyw2SEFBb0g7QUFJcEgsSUFBYSx1QkFBdUIsK0JBQXBDLE1BQWEsdUJBQXVCO0lBYWhDOzs7Ozs7Ozs7Ozs7T0FZRztJQUNILEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxZQUEwQixFQUFFLE9BQXNCLEVBQUUsU0FBdUMsRUFBRSxVQUFrQixFQUFFLFNBQWlCLEVBQUUsT0FBZTtRQUVyTCxNQUFNLG1CQUFtQixHQUEwQjtZQUMvQyxlQUFlLEVBQUUsT0FBTztZQUN4QixnQkFBZ0IsRUFBRSx5QkFBdUIsQ0FBQywyQkFBMkIsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDO1lBQzVGLFVBQVUsRUFBRSx5QkFBdUIsQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDO1lBQ2hGLGVBQWUsRUFBRSxZQUFZLENBQUMsZUFBZTtTQUNoRCxDQUFDO1FBQ0YsSUFBSSxtQkFBbUIsQ0FBQyxnQkFBZ0IsS0FBSyxtQ0FBNEIsQ0FBQyxVQUFVLEVBQUU7WUFDbEYsbUJBQW1CLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUMvQixtQkFBbUIsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLDZCQUE2QixDQUFDLGlDQUFpQyxDQUFDO2dCQUNqRyxTQUFTLEVBQUUsWUFBWSxDQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUUsWUFBWSxDQUFDLFdBQVc7Z0JBQ3hFLFVBQVUsRUFBRSxZQUFZLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxZQUFZLENBQUMsUUFBUTtnQkFDcEUsTUFBTSxFQUFFLENBQUMs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