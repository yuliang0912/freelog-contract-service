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
const client_1 = require("../kafka/client");
let ContractFsmEventHandler = ContractFsmEventHandler_1 = class ContractFsmEventHandler {
    mongoose;
    kafkaClient;
    contractInfoProvider;
    contractTransitionRecordProvider;
    contractEnvironmentVariableHandler;
    contractInfoSignatureProvider;
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
            updateContractModel.status = egg_freelog_base_1.ContractStatusEnum.Terminated;
            updateContractModel.uniqueKey = this.contractInfoSignatureProvider.contractBaseInfoUniqueKeyGenerate({
                subjectId: contractInfo.subjectId, subjectType: contractInfo.subjectType,
                licenseeId: contractInfo.licenseeId, policyId: contractInfo.policyId,
                status: egg_freelog_base_1.ContractStatusEnum.Terminated, contractId: contractInfo.contractId
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
            return this.execAuthStatusChangedEventHandle(contractInfo, updateContractModel.authStatus, updateContractModel.status);
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
     * @param contractStatus
     */
    async execAuthStatusChangedEventHandle(contractInfo, afterAuthStatus, contractStatus) {
        if (contractInfo.authStatus === afterAuthStatus) {
            return;
        }
        const msgBody = {
            contractId: contractInfo.contractId,
            subjectId: contractInfo.subjectId,
            subjectName: contractInfo.subjectName,
            subjectType: contractInfo.subjectType,
            licenseeId: contractInfo.licenseeId,
            licenseeOwnerId: contractInfo.licenseeOwnerId,
            licensorId: contractInfo.licensorId,
            licensorOwnerId: contractInfo.licensorOwnerId,
            beforeAuthStatus: contractInfo.authStatus,
            licenseeIdentityType: contractInfo.licenseeIdentityType,
            afterAuthStatus, contractStatus
        };
        const topicName = `${egg_freelog_base_1.ContractLicenseeIdentityTypeEnum[contractInfo.licenseeIdentityType.toString()].toLowerCase()}-contract-auth-status-changed-topic`;
        return this.kafkaClient.send({
            topic: topicName,
            acks: -1,
            messages: [{
                    key: contractInfo.contractId,
                    value: JSON.stringify(msgBody),
                    headers: { contractId: contractInfo.contractId }
                }]
        });
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
    (0, midway_1.plugin)(),
    __metadata("design:type", Object)
], ContractFsmEventHandler.prototype, "mongoose", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", client_1.KafkaClient)
], ContractFsmEventHandler.prototype, "kafkaClient", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ContractFsmEventHandler.prototype, "contractInfoProvider", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ContractFsmEventHandler.prototype, "contractTransitionRecordProvider", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", contract_environment_variable_handler_1.ContractEnvironmentVariableHandler)
], ContractFsmEventHandler.prototype, "contractEnvironmentVariableHandler", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", contract_info_signature_generator_1.ContractInfoSignatureProvider)
], ContractFsmEventHandler.prototype, "contractInfoSignatureProvider", void 0);
ContractFsmEventHandler = ContractFsmEventHandler_1 = __decorate([
    (0, midway_1.provide)(),
    (0, midway_1.scope)(midway_1.ScopeEnum.Singleton)
], ContractFsmEventHandler);
exports.ContractFsmEventHandler = ContractFsmEventHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZnNtLWV2ZW50LWhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udHJhY3QtZnNtLXNlcnZpY2UvY29udHJhY3QtZnNtLWV2ZW50LWhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBLGtDQUE4RjtBQVE5Rix1REFJMEI7QUFDMUIsbUNBQWlFO0FBRWpFLDJHQUFtRztBQUNuRyw2SEFBb0g7QUFDcEgsNENBQTRDO0FBSTVDLElBQWEsdUJBQXVCLCtCQUFwQyxNQUFhLHVCQUF1QjtJQUdoQyxRQUFRLENBQUM7SUFFVCxXQUFXLENBQWM7SUFFekIsb0JBQW9CLENBQWtDO0lBRXRELGdDQUFnQyxDQUE4QztJQUU5RSxrQ0FBa0MsQ0FBcUM7SUFFdkUsNkJBQTZCLENBQWdDO0lBRTdEOzs7Ozs7Ozs7Ozs7T0FZRztJQUNILEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxZQUEwQixFQUFFLE9BQXNCLEVBQUUsU0FBdUMsRUFBRSxVQUFrQixFQUFFLFNBQWlCLEVBQUUsT0FBZTtRQUVyTCxNQUFNLG1CQUFtQixHQUEwQjtZQUMvQyxlQUFlLEVBQUUsT0FBTztZQUN4QixnQkFBZ0IsRUFBRSx5QkFBdUIsQ0FBQywyQkFBMkIsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDO1lBQzVGLFVBQVUsRUFBRSx5QkFBdUIsQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDO1lBQ2hGLGVBQWUsRUFBRSxZQUFZLENBQUMsZUFBZTtTQUNoRCxDQUFDO1FBQ0YsSUFBSSxtQkFBbUIsQ0FBQyxnQkFBZ0IsS0FBSyxtQ0FBNEIsQ0FBQyxVQUFVLEVBQUU7WUFDbEYsbUJBQW1CLENBQUMsTUFBTSxHQUFHLHFDQUFrQixDQUFDLFVBQVUsQ0FBQztZQUMzRCxtQkFBbUIsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLDZCQUE2QixDQUFDLGlDQUFpQyxDQUFDO2dCQUNqRyxTQUFTLEVB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