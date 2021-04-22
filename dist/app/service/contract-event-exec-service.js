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
        if (contractInfo?.licenseeOwnerId !== this.ctx.userId || contractInfo?.licensorOwnerId !== this.ctx.userId) {
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
        // return this.eventCodeHandlerMap.get(eventInfo.code)(contractFsm, eventInfo, ...args);
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
    transactionEventHandle(contractFsm, eventInfo, accountId, transactionAmount, password) {
        const { args, eventId } = eventInfo;
        // 交易金额二次传递确认是为了保证前端显示的交易金额与后端的计算金额一致,防止出现技术失误
        if (!new decimal_js_light_1.default(args.amount).eq(transactionAmount)) {
            throw new egg_freelog_base_1.ApplicationError('交易金额与合约约定的金额不符合');
        }
        const contractInfo = contractFsm.contractInfo;
        return this.outsideApiService.contractPayment(accountId, args.account, transactionAmount, contractInfo.contractId, contractInfo.contractName, eventId, password);
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
ContractEventExecService = __decorate([
    midway_1.provide(),
    __metadata("design:paramtypes", [])
], ContractEventExecService);
exports.ContractEventExecService = ContractEventExecService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZXZlbnQtZXhlYy1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9zZXJ2aWNlL2NvbnRyYWN0LWV2ZW50LWV4ZWMtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFFdkMscUNBQTJDO0FBQzNDLHFEQUErQztBQUMvQyx1REFBc0U7QUFDdEUsK0RBQXdEO0FBQ3hELHVEQUF1QztBQUV2QyxlQUFlO0FBRWYsSUFBYSx3QkFBd0IsR0FBckMsTUFBYSx3QkFBd0I7SUFhakM7UUFGUSx3QkFBbUIsR0FBRyxJQUFJLEdBQUcsRUFBcUcsQ0FBQztRQUd2SSxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLHNCQUFlLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzNHLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxLQUFLLENBQUMsaUJBQWlCLENBQUMsWUFBMEIsRUFBRSxTQUEwQixFQUFFLE9BQWUsRUFBRSxHQUFHLElBQUk7UUFDcEcsSUFBSSxZQUFZLEVBQUUsZUFBZSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFJLFlBQVksRUFBRSxlQUFlLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUU7WUFDeEcsTUFBTSxJQUFJLHFDQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQztTQUMvRTtRQUNELElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFO1lBQzFCLFlBQVksQ0FBQyxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQztTQUNqRztRQUNELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUN0QyxNQUFNLElBQUksbUNBQWdCLENBQUMsYUFBYSxDQUFDLENBQUM7U0FDN0M7UUFDRCxNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMvQyxNQUFNLElBQUksbUNBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDeEM7UUFDRCxJQUFJLFNBQVMsQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO1lBQzlCLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1NBQ2pEO1FBQ0Qsd0ZBQXdGO1FBQ3hGLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNoSCxDQUFDO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSyxzQkFBc0IsQ0FBQyxXQUFrQyxFQUFFLFNBQTBCLEVBQUUsU0FBaUIsRUFBRSxpQkFBeUIsRUFBRSxRQUFnQjtRQUN6SixNQUFNLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBQyxHQUFHLFNBQVMsQ0FBQztRQUNsQyw4Q0FBOEM7UUFDOUMsSUFBSSxDQUFDLElBQUksMEJBQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7WUFDakQsTUFBTSxJQUFJLG1DQUFnQixDQUFDLGlCQUFpQixDQUFDLENBQUM7U0FDakQ7UUFDRCxNQUFNLFlBQVksR0FBRyxXQUFXLENBQUMsWUFBWSxDQUFDO1FBQzlDLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxZQUFZLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxZQUFZLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3JLLENBQUM7Q0FDSixDQUFBO0FBN0RHO0lBREMsZUFBTSxFQUFFOztxREFDTDtBQUVKO0lBREMsZUFBTSxFQUFFOzhCQUNNLDhCQUFhOytEQUFDO0FBRTdCO0lBREMsZUFBTSxFQUFFOzhCQUNVLHVDQUFpQjttRUFBQztBQUVyQztJQURDLGVBQU0sRUFBRTs7MkVBQ3dFO0FBVHhFLHdCQUF3QjtJQURwQyxnQkFBTyxFQUFFOztHQUNHLHdCQUF3QixDQWdFcEM7QUFoRVksNERBQXdCIn0=