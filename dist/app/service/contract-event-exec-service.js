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
exports.ContractEventExecService = void 0;
const midway_1 = require("midway");
const enum_1 = require("../../enum");
const policy_service_1 = require("./policy-service");
const egg_freelog_base_1 = require("egg-freelog-base");
const outside_api_service_1 = require("./outside-api-service");
const decimal_js_light_1 = require("decimal.js-light");
const contract_environment_variable_handler_1 = require("../../extend/contract-environment-variable-handler");
// 只执行需要人为触发的事件
let ContractEventExecService = class ContractEventExecService {
    constructor() {
        this.eventCodeHandlerMap = new Map();
        this.eventCodeHandlerMap.set(enum_1.PolicyEventEnum.TransactionEvent, this.transactionEventHandle.bind(this));
    }
    /**
     * 初始化合约
     * @param contractInfo
     */
    async initialContract(contractInfo) {
        if (!contractInfo.policyInfo) {
            contractInfo.policyInfo = await this.policyService.findOne({ policyId: contractInfo.policyId });
        }
        const session = await this.mongoose.startSession();
        await session.withTransaction(() => {
            return this.buildContractStateMachine(contractInfo).execInitial(session);
        }).catch(error => {
            console.log('合约初始化错误,message:' + error.toString());
            throw error;
        }).finally(() => {
            session.endSession();
        });
        return true;
    }
    /**
     * 执行合约事件
     * @param contractInfo
     * @param eventType
     * @param eventId
     * @param args
     */
    async execContractEvent(contractInfo, eventType, eventId, ...args) {
        if (!this.contractExecutePermissionCheck(contractInfo, eventType)) {
            throw new egg_freelog_base_1.AuthorizationError(this.ctx.gettext('user-authorization-failed'));
        }
        if (!contractInfo.policyInfo) {
            contractInfo.policyInfo = await this.policyService.findOne({ policyId: contractInfo.policyId });
        }
        const contractFsm = this.buildContractStateMachine(contractInfo);
        if (!contractFsm.isCanExecEvent(eventId)) {
            throw new egg_freelog_base_1.ApplicationError('当前合约不能执行该事件');
        }
        const eventInfo = contractFsm.getEventInfo(eventId);
        if (!this.eventCodeHandlerMap.has(eventInfo.code)) {
            throw new egg_freelog_base_1.ApplicationError('不支持的事件');
        }
        if (eventInfo.code !== eventType) {
            throw new egg_freelog_base_1.ApplicationError('实际事件与预设的事件类型不匹配');
        }
        return Reflect.apply(this.eventCodeHandlerMap.get(eventInfo.code), this, [contractFsm, eventInfo, ...args]);
    }
    /**
     * 交易事件触发(发送交易请求到支付服务..后续的处理由支付何物和合约服务自动对接)
     * @param contractFsm
     * @param eventInfo
     * @param accountId
     * @param transactionAmount
     * @param password
     * @private
     */
    async transactionEventHandle(contractFsm, eventInfo, accountId, transactionAmount, password) {
        const { args, eventId } = eventInfo;
        // 交易金额二次传递确认是为了保证前端显示的交易金额与后端的计算金额一致,防止出现技术失误
        if (!new decimal_js_light_1.default(args.amount).eq(transactionAmount)) {
            throw new egg_freelog_base_1.ApplicationError('交易金额与合约约定的金额不符合');
        }
        const contractInfo = contractFsm.contractInfo;
        let reciprocalAccountId = args.account;
        if (this.contractEnvironmentVariableHandler.isIncludesStaticEnvironmentVariable(reciprocalAccountId)) {
            const envArgInfo = await this.contractEnvironmentVariableHandler.getEnvironmentVariable(contractInfo, reciprocalAccountId);
            reciprocalAccountId = envArgInfo?.accountId; // 合约初始化成功,则一定存在账户ID属性.
        }
        // 合约支付请求之后,支付中心会冻结掉交易金额.然后等合约状态拨动完毕之后,发送确认结果.支付中心再执行真实扣款操作
        return this.outsideApiService.contractPayment(accountId, reciprocalAccountId, transactionAmount, contractInfo.contractId, contractInfo.subjectType, contractInfo.subjectName, contractInfo.contractName, eventId, password);
    }
    /**
     * 合约执行权限校验
     * @param contractInfo
     * @param eventType
     * @private
     */
    contractExecutePermissionCheck(contractInfo, eventType) {
        const isLicensee = contractInfo?.licenseeOwnerId === this.ctx.userId;
        //const isLicensor = contractInfo?.licensorOwnerId === this.ctx.userId;
        // 目前只支持乙方触发交易事件.后续动态调整,比如甲方没收保证金
        return isLicensee && [enum_1.PolicyEventEnum.TransactionEvent].includes(eventType);
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractEventExecService.prototype, "ctx", void 0);
__decorate([
    midway_1.plugin(),
    __metadata("design:type", Object)
], ContractEventExecService.prototype, "mongoose", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", policy_service_1.PolicyService)
], ContractEventExecService.prototype, "policyService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", outside_api_service_1.OutsideApiService)
], ContractEventExecService.prototype, "outsideApiService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Function)
], ContractEventExecService.prototype, "buildContractStateMachine", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", contract_environment_variable_handler_1.ContractEnvironmentVariableHandler)
], ContractEventExecService.prototype, "contractEnvironmentVariableHandler", void 0);
ContractEventExecService = __decorate([
    midway_1.provide(),
    __metadata("design:paramtypes", [])
], ContractEventExecService);
exports.ContractEventExecService = ContractEventExecService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZXZlbnQtZXhlYy1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9zZXJ2aWNlL2NvbnRyYWN0LWV2ZW50LWV4ZWMtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBK0M7QUFFL0MscUNBQTJDO0FBQzNDLHFEQUErQztBQUMvQyx1REFBc0U7QUFDdEUsK0RBQXdEO0FBQ3hELHVEQUF1QztBQUN2Qyw4R0FBc0c7QUFFdEcsZUFBZTtBQUVmLElBQWEsd0JBQXdCLEdBQXJDLE1BQWEsd0JBQXdCO0lBaUJqQztRQUZRLHdCQUFtQixHQUFHLElBQUksR0FBRyxFQUFxRyxDQUFDO1FBR3ZJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsc0JBQWUsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDM0csQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxlQUFlLENBQUMsWUFBMEI7UUFDNUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUU7WUFDMUIsWUFBWSxDQUFDLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDO1NBQ2pHO1FBQ0QsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ25ELE1BQU0sT0FBTyxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUU7WUFDL0IsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsWUFBWSxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzdFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDbkQsTUFBTSxLQUFLLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRTtZQUNaLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN6QixDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxLQUFLLENBQUMsaUJBQWlCLENBQUMsWUFBMEIsRUFBRSxTQUEwQixFQUFFLE9BQWUsRUFBRSxHQUFHLElBQUk7UUFDcEcsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLEVBQUU7WUFDL0QsTUFBTSxJQUFJLHFDQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQztTQUMvRTtRQUNELElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFO1lBQzFCLFlBQVksQ0FBQyxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQztTQUNqRztRQUNELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUN0QyxNQUFNLElBQUksbUNBQWdCLENBQUMsYUFBYSxDQUFDLENBQUM7U0FDN0M7UUFDRCxNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMvQyxNQUFNLElBQUksbUNBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDeEM7UUFDRCxJQUFJLFNBQVMsQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO1lBQzlCLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1NBQ2pEO1FBQ0QsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2hILENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNLLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxXQUFrQyxFQUFFLFNBQTBCLEVBQUUsU0FBaUIsRUFBRSxpQkFBeUIsRUFBRSxRQUFnQjtRQUMvSixNQUFNLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBQyxHQUFHLFNBQVMsQ0FBQztRQUNsQyw4Q0FBOEM7UUFDOUMsSUFBSSxDQUFDLElBQUksMEJBQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7WUFDakQsTUFBTSxJQUFJLG1DQUFnQixDQUFDLGlCQUFpQixDQUFDLENBQUM7U0FDakQ7UUFDRCxNQUFNLFlBQVksR0FBRyxXQUFXLENBQUMsWUFBWSxDQUFDO1FBQzlDLElBQUksbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN2QyxJQUFJLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxtQ0FBbUMsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFO1lBQ2xHLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGtDQUFrQyxDQUFDLHNCQUFzQixDQUFDLFlBQVksRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1lBQzNILG1CQUFtQixHQUFHLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQyx1QkFBdUI7U0FDdkU7UUFDRCwyREFBMkQ7UUFDM0QsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxtQkFBbUIsRUFBRSxpQkFBaUIsRUFBRSxZQUFZLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNoTyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSyw4QkFBOEIsQ0FBQyxZQUEwQixFQUFFLFNBQTBCO1FBQ3pGLE1BQU0sVUFBVSxHQUFHLFlBQVksRUFBRSxlQUFlLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFDckUsdUVBQXVFO1FBQ3ZFLGlDQUFpQztRQUNqQyxPQUFPLFVBQVUsSUFBSSxDQUFDLHNCQUFlLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDaEYsQ0FBQztDQUNKLENBQUE7QUF2R0c7SUFEQyxlQUFNLEVBQUU7O3FEQUNMO0FBRUo7SUFEQyxlQUFNLEVBQUU7OzBEQUNBO0FBRVQ7SUFEQyxlQUFNLEVBQUU7OEJBQ00sOEJBQWE7K0RBQUM7QUFFN0I7SUFEQyxlQUFNLEVBQUU7OEJBQ1UsdUNBQWlCO21FQUFDO0FBRXJDO0lBREMsZUFBTSxFQUFFOzsyRUFDd0U7QUFFakY7SUFEQyxlQUFNLEVBQUU7OEJBQzJCLDBFQUFrQztvRkFBQztBQWI5RCx3QkFBd0I7SUFEcEMsZ0JBQU8sRUFBRTs7R0FDRyx3QkFBd0IsQ0EwR3BDO0FBMUdZLDREQUF3QiJ9