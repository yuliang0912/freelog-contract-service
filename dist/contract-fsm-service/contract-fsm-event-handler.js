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
    midway_1.plugin(),
    __metadata("design:type", Object)
], ContractFsmEventHandler.prototype, "mongoose", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", client_1.KafkaClient)
], ContractFsmEventHandler.prototype, "kafkaClient", void 0);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZnNtLWV2ZW50LWhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udHJhY3QtZnNtLXNlcnZpY2UvY29udHJhY3QtZnNtLWV2ZW50LWhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBLGtDQUE4RjtBQVE5Rix1REFJMEI7QUFDMUIsbUNBQWlFO0FBRWpFLDJHQUFtRztBQUNuRyw2SEFBb0g7QUFDcEgsNENBQTRDO0FBSTVDLElBQWEsdUJBQXVCLCtCQUFwQyxNQUFhLHVCQUF1QjtJQWVoQzs7Ozs7Ozs7Ozs7O09BWUc7SUFDSCxLQUFLLENBQUMsK0JBQStCLENBQUMsWUFBMEIsRUFBRSxPQUFzQixFQUFFLFNBQXVDLEVBQUUsVUFBa0IsRUFBRSxTQUFpQixFQUFFLE9BQWU7UUFFckwsTUFBTSxtQkFBbUIsR0FBMEI7WUFDL0MsZUFBZSxFQUFFLE9BQU87WUFDeEIsZ0JBQWdCLEVBQUUseUJBQXVCLENBQUMsMkJBQTJCLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQztZQUM1RixVQUFVLEVBQUUseUJBQXVCLENBQUMscUJBQXFCLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQztZQUNoRixlQUFlLEVBQUUsWUFBWSxDQUFDLGVBQWU7U0FDaEQsQ0FBQztRQUNGLElBQUksbUJBQW1CLENBQUMsZ0JBQWdCLEtBQUssbUNBQTRCLENBQUMsVUFBVSxFQUFFO1lBQ2xGLG1CQUFtQixDQUFDLE1BQU0sR0FBRyxxQ0FBa0IsQ0FBQyxVQUFVLENBQUM7WUFDM0QsbUJBQW1CLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxpQ0FBaUMsQ0FBQztnQkFDakcsU0FBUyxFQUFFLFlBQVksQ0FBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLFlBQVksQ0FBQyxXQUFXO2dCQUN4RSxVQUFVLEVBQUUsWUFBWSxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsWUFBWSxDQUFDLFFBQVE7Z0JBQ3BFLE1BQU0sRUFBRSxxQ0FBa0IsQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLFlBQVksQ0FBQyxVQUFVO2FBQzdFLENBQUMsQ0FBQztTQUNOO1FBQ0QsTUFBTSxnQkFBZ0IsR0FBNkI7WUFDL0MsR0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFO1lBQ25DLFVBQVUsRUFBRSxZQUFZLENBQUMsVUFBVTtZQUNuQyxTQUFTLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUztTQUNyRCxDQUFDO1FBRUYsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDO1FBQzFGLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsRUFBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLFVBQVUsRUFBQyxFQUFFLG1CQUFtQixFQUFFLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQztRQUNsSCxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ3hDLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLFlBQVksQ0FBQyxVQUFVLFNBQVMsU0FBUyxPQUFPLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDNUYsT0FBTyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsWUFBWSxFQUFFLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzSCxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sZ0JBQWdCLENBQUMsR0FBRyxDQUFDO0lBQ2hDLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxZQUEwQixFQUFFLFNBQXVDLEVBQUUsUUFBZ0I7UUFDbEgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLFlBQVksQ0FBQyxVQUFVLFNBQVMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUM3RCxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUM7WUFDdkMsR0FBRyxFQUFFLFlBQVksQ0FBQyxVQUFVO1lBQzVCLGdCQUFnQixFQUFFLEVBQUMsR0FBRyxFQUFFLENBQUMsbUNBQTRCLENBQUMsYUFBYSxFQUFFLG1DQUE0QixDQUFDLGdCQUFnQixDQUFDLEVBQUM7U0FDdkgsRUFBRTtZQUNDLGdCQUFnQixFQUFFLG1DQUE0QixDQUFDLGdCQUFnQjtTQUNsRSxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMsQ0FBQyxPQUFPLHNCQUFlLENBQUMsWUFBWSxRQUFRLENBQUMsQ0FBQyxZQUEwQixFQUFFLE9BQXNCLEVBQUUsU0FBdUM7UUFDM0ksSUFBSSxDQUFDLENBQUMsbUNBQTRCLENBQUMsZ0JBQWdCLEVBQUUsbUNBQTRCLENBQUMsYUFBYSxDQUFDLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1lBQ3RJLE9BQU87U0FDVjtRQUNELGNBQWM7UUFDZCxNQUFNLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxnQ0FBZ0MsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNqRyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMsZ0NBQWdDLENBQUMsWUFBMEIsRUFBRSxlQUF1QyxFQUFFLGNBQWtDO1FBQzFJLElBQUksWUFBWSxDQUFDLFVBQVUsS0FBSyxlQUFlLEVBQUU7WUFDN0MsT0FBTztTQUNWO1FBRUQsTUFBTSxPQUFPLEdBQTJDO1lBQ3BELFVBQVUsRUFBRSxZQUFZLENBQUMsVUFBVTtZQUNuQyxTQUFTLEVBQUUsWUFBWSxDQUFDLFNBQVM7WUFDakMsV0FBVyxFQUFFLFlBQVksQ0FBQyxXQUFXO1lBQ3JDLFdBQVcsRUFBRSxZQUFZLENBQUMsV0FBVztZQUNyQyxVQUFVLEVBQUUsWUFBWSxDQUFDLFVBQVU7WUFDbkMsZUFBZSxFQUFFLFlBQVksQ0FBQyxlQUFlO1lBQzdDLFVBQVUsRUFBRSxZQUFZLENBQUMsVUFBVTtZQUNuQyxlQUFlLEVBQUUsWUFBWSxDQUFDLGVBQWU7WUFDN0MsZ0JBQWdCLEVBQUUsWUFBWSxDQUFDLFVBQVU7WUFDekMsb0JBQW9CLEVBQUUsWUFBWSxDQUFDLG9CQUFvQjtZQUN2RCxlQUFlLEVBQUUsY0FBYztTQUNsQyxDQUFDO1FBRUYsTUFBTSxTQUFTLEdBQUcsR0FBRyxtREFBZ0MsQ0FBQyxZQUFZLENBQUMsb0JBQW9CLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUscUNBQXFDLENBQUM7UUFDdkosT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztZQUN6QixLQUFLLEVBQUUsU0FBUztZQUNoQixJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ1IsUUFBUSxFQUFFLENBQUM7b0JBQ1AsR0FBRyxFQUFFLFlBQVksQ0FBQyxVQUFVO29CQUM1QixLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7b0JBQzlCLE9BQU8sRUFBRSxFQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsVUFBVSxFQUFDO2lCQUNqRCxDQUFDO1NBQ0wsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLHFCQUFxQixDQUFDLFlBQTBCLEVBQUUsT0FBZTtRQUNwRSxNQUFNLDhCQUE4QixHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0YsSUFBSSw4QkFBOEIsRUFBRSxNQUFNLElBQUksOEJBQThCLEVBQUUsVUFBVSxFQUFFO1lBQ3RGLE9BQU8sNkJBQXNCLENBQUMsVUFBVSxHQUFHLDZCQUFzQixDQUFDLGtCQUFrQixDQUFDO1NBQ3hGO2FBQU0sSUFBSSw4QkFBOEIsRUFBRSxNQUFNLEVBQUU7WUFDL0MsT0FBTyw2QkFBc0IsQ0FBQyxVQUFVLENBQUM7U0FDNUM7YUFBTSxJQUFJLDhCQUE4QixFQUFFLFVBQVUsRUFBRTtZQUNuRCxPQUFPLDZCQUFzQixDQUFDLGtCQUFrQixDQUFDO1NBQ3BEO2FBQU07WUFDSCxPQUFPLDZCQUFzQixDQUFDLFlBQVksQ0FBQztTQUM5QztJQUNMLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxZQUEwQixFQUFFLE9BQWU7UUFDMUUsTUFBTSx1QkFBdUIsR0FBNEIsWUFBWSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3RyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxLQUFLO1lBQ2pDLE9BQU8sbUNBQTRCLENBQUMsT0FBTyxDQUFDO1NBQy9DO1FBQ0QseUJBQXlCO1FBQ3pCLElBQUksdUJBQXVCLENBQUMsTUFBTSxJQUFJLENBQUMsdUJBQXVCLENBQUMsV0FBVyxFQUFFO1lBQ3hFLE9BQU8sbUNBQTRCLENBQUMsT0FBTyxDQUFDO1NBQy9DO1FBQ0Qsc0NBQXNDO1FBQ3RDLElBQUksdUJBQXVCLENBQUMsV0FBVyxJQUFJLHVCQUF1QixDQUFDLFVBQVUsSUFBSSxZQUFZLENBQUMsb0JBQW9CLEtBQUssbURBQWdDLENBQUMsVUFBVSxFQUFFO1lBQ2hLLE9BQU8sbUNBQTRCLENBQUMsT0FBTyxDQUFDO1NBQy9DO1FBQ0QsT0FBTyxtQ0FBNEIsQ0FBQyxVQUFVLENBQUM7SUFDbkQsQ0FBQztDQUNKLENBQUE7QUFuS0c7SUFEQyxlQUFNLEVBQUU7O3lEQUNBO0FBRVQ7SUFEQyxlQUFNLEVBQUU7OEJBQ0ksb0JBQVc7NERBQUM7QUFFekI7SUFEQyxlQUFNLEVBQUU7O3FFQUM2QztBQUV0RDtJQURDLGVBQU0sRUFBRTs7aUZBQ3FFO0FBRTlFO0lBREMsZUFBTSxFQUFFOzhCQUMyQiwwRUFBa0M7bUZBQUM7QUFFdkU7SUFEQyxlQUFNLEVBQUU7OEJBQ3NCLGlFQUE2Qjs4RUFBQztBQWJwRCx1QkFBdUI7SUFGbkMsZ0JBQU8sRUFBRTtJQUNULGNBQUssQ0FBQyxrQkFBUyxDQUFDLFNBQVMsQ0FBQztHQUNkLHVCQUF1QixDQXNLbkM7QUF0S1ksMERBQXVCIn0=