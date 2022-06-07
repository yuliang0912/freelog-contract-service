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
            fsmDeclarations: contractInfo.fsmDeclarations,
            fsmCurrentStateColors: contractInfo.policyInfo.fsmDescriptionInfo[toState]?.serviceStates ?? []
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
            // console.log(`修改合约状态,contractId:${contractInfo.contractId},from:${fromState},to:${toState}`);
            if (fromState === '_none_') {
                // 2秒之后再发送状态变更消息,给其他服务预留足够的数据处理时间. 因为初始化之后会发生合约状态变更. 也会产生对应的mq消息.
                setTimeout(() => this.execAuthStatusChangedEventHandle(contractInfo, updateContractModel.authStatus, updateContractModel.status, updateContractModel.fsmCurrentStateColors), 2000);
                return;
            }
            return this.execAuthStatusChangedEventHandle(contractInfo, updateContractModel.authStatus, updateContractModel.status, updateContractModel.fsmCurrentStateColors);
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
        console.error(`合约${contractInfo.contractId}初始化错误,${errorMsg}`);
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
     * @param afterStateColors
     */
    async execAuthStatusChangedEventHandle(contractInfo, afterAuthStatus, contractStatus, afterStateColors) {
        if (contractInfo.authStatus === afterAuthStatus) {
            return;
        }
        const msgBody = {
            contractId: contractInfo.contractId,
            policyId: contractInfo.policyId,
            subjectId: contractInfo.subjectId,
            subjectName: contractInfo.subjectName,
            subjectType: contractInfo.subjectType,
            licenseeId: contractInfo.licenseeId,
            licenseeOwnerId: contractInfo.licenseeOwnerId,
            licensorId: contractInfo.licensorId,
            licensorOwnerId: contractInfo.licensorOwnerId,
            beforeAuthStatus: contractInfo.authStatus,
            licenseeIdentityType: contractInfo.licenseeIdentityType,
            afterStateColors, afterAuthStatus, contractStatus
        };
        let topicName = `${egg_freelog_base_1.ContractLicenseeIdentityTypeEnum[contractInfo.licenseeIdentityType.toString()].toLowerCase()}-contract-auth-status-changed-topic`;
        if (contractInfo.subjectType === egg_freelog_base_1.SubjectTypeEnum.UserGroup) {
            topicName = `user-group-contract-auth-status-changed-topic`;
        }
        return this.kafkaClient.send({
            topic: topicName,
            acks: -1,
            messages: [{
                    key: contractInfo.contractId,
                    value: JSON.stringify(msgBody),
                    headers: { contractId: contractInfo.contractId }
                }]
        }).catch(error => {
            console.log('kafka消息发送失败', error);
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
        if (contractInfo.fsmRunningStatus === enum_1.ContractFsmRunningStatusEnum.ToBeRegisteredEvents) {
            return enum_1.ContractFsmRunningStatusEnum.ToBeRegisteredEvents;
        }
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
        // 用户组合约如果终止态还存在对应的色块,则依然处于运行状态
        if (contractInfo.subjectType === egg_freelog_base_1.SubjectTypeEnum.UserGroup && fsmStateDescriptionInfo.serviceStates?.length) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZnNtLWV2ZW50LWhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udHJhY3QtZnNtLXNlcnZpY2UvY29udHJhY3QtZnNtLWV2ZW50LWhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBLGtDQUE4RjtBQVE5Rix1REFLMEI7QUFDMUIsbUNBQWlFO0FBRWpFLDJHQUFtRztBQUNuRyw2SEFBb0g7QUFDcEgsNENBQTRDO0FBSTVDLElBQWEsdUJBQXVCLCtCQUFwQyxNQUFhLHVCQUF1QjtJQUdoQyxRQUFRLENBQUM7SUFFVCxXQUFXLENBQWM7SUFFekIsb0JBQW9CLENBQWtDO0lBRXRELGdDQUFnQyxDQUE4QztJQUU5RSxrQ0FBa0MsQ0FBcUM7SUFFdkUsNkJBQTZCLENBQWdDO0lBRTdEOzs7Ozs7Ozs7Ozs7T0FZRztJQUNILEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxZQUEwQixFQUFFLE9BQXNCLEVBQUUsU0FBdUMsRUFBRSxVQUFrQixFQUFFLFNBQWlCLEVBQUUsT0FBZTtRQUVyTCxNQUFNLG1CQUFtQixHQUEwQjtZQUMvQyxlQUFlLEVBQUUsT0FBTztZQUN4QixnQkFBZ0IsRUFBRSx5QkFBdUIsQ0FBQywyQkFBMkIsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDO1lBQzVGLFVBQVUsRUFBRSx5QkFBdUIsQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDO1lBQ2hGLGVBQWUsRUFBRSxZQUFZLENBQUMsZUFBZTtZQUM3QyxxQkFBcUIsRUFBRSxZQUFZLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxFQUFFLGFBQWEsSUFBSSxFQUFFO1NBQ2xHLENBQUM7UUFDRixJQUFJLG1CQUFtQixDQUFDLGdCQUFnQixLQUFLLG1DQUE0QixDQUFDLFVBQVUsRUFBRTtZQUNsRixtQkFBbUIsQ0FBQyxNQUFNLEdBQUcscUNBQWtCLENBQUMsVUFBVSxD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