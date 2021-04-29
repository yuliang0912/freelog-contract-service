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
        return this.outsideApiService.contractPayment(accountId, reciprocalAccountId, transactionAmount, contractInfo.contractId, contractInfo.contractName, eventId, password);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZXZlbnQtZXhlYy1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9zZXJ2aWNlL2NvbnRyYWN0LWV2ZW50LWV4ZWMtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFFdkMscUNBQTJDO0FBQzNDLHFEQUErQztBQUMvQyx1REFBc0U7QUFDdEUsK0RBQXdEO0FBQ3hELHVEQUF1QztBQUN2Qyw4R0FBc0c7QUFFdEcsZUFBZTtBQUVmLElBQWEsd0JBQXdCLEdBQXJDLE1BQWEsd0JBQXdCO0lBZWpDO1FBRlEsd0JBQW1CLEdBQUcsSUFBSSxHQUFHLEVBQXFHLENBQUM7UUFHdkksSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxzQkFBZSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUMzRyxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsS0FBSyxDQUFDLGlCQUFpQixDQUFDLFlBQTBCLEVBQUUsU0FBMEIsRUFBRSxPQUFlLEVBQUUsR0FBRyxJQUFJO1FBQ3BHLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxFQUFFO1lBQy9ELE1BQU0sSUFBSSxxQ0FBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7U0FDL0U7UUFDRCxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRTtZQUMxQixZQUFZLENBQUMsVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLFFBQVEsRUFBQyxDQUFDLENBQUM7U0FDakc7UUFDRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMs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