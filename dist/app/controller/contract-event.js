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
exports.ContractEventController = void 0;
const midway_1 = require("midway");
const contract_event_exec_service_1 = require("../service/contract-event-exec-service");
const egg_freelog_base_1 = require("egg-freelog-base");
const enum_1 = require("../../enum");
let ContractEventController = class ContractEventController {
    ctx;
    contractService;
    contractEventExecService;
    /**
     * 支付事件
     */
    async payment() {
        const { ctx } = this;
        const contractId = ctx.checkParams('contractId').isContractId().value;
        const eventId = ctx.checkBody('eventId').exist().isMd5().value;
        const accountId = ctx.checkBody('accountId').exist().type('string').value;
        const password = ctx.checkBody('password').exist().type('string').len(6, 6).value;
        const transactionAmount = ctx.checkBody('transactionAmount').exist().toFloat().value;
        ctx.validateParams();
        const contractInfo = await this.contractService.findById(contractId);
        if (!contractInfo) {
            throw new egg_freelog_base_1.ApplicationError(ctx.gettext('contract-entity-not-found'));
        }
        await this.contractEventExecService.execContractEvent(contractInfo, enum_1.PolicyEventEnum.TransactionEvent, eventId, accountId, transactionAmount, password).then(ctx.success);
    }
    /**
     * 初始化事件(人工主动初始化接口)
     */
    async initial() {
        const { ctx } = this;
        const contractId = ctx.checkParams('contractId').isContractId().value;
        ctx.validateParams();
        const contractInfo = await this.contractService.findById(contractId);
        if (!contractInfo) {
            throw new egg_freelog_base_1.ApplicationError(ctx.gettext('contract-entity-not-found'));
        }
        await this.contractEventExecService.initialContract(contractInfo).then(ctx.success);
    }
};
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ContractEventController.prototype, "ctx", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ContractEventController.prototype, "contractService", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", contract_event_exec_service_1.ContractEventExecService)
], ContractEventController.prototype, "contractEventExecService", void 0);
__decorate([
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    (0, midway_1.post)('/:contractId/events/payment'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractEventController.prototype, "payment", null);
__decorate([
    (0, midway_1.post)('/:contractId/events/init'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractEventController.prototype, "initial", null);
ContractEventController = __decorate([
    (0, midway_1.provide)(),
    (0, midway_1.priority)(1),
    (0, midway_1.controller)('/v2/contracts')
], ContractEventController);
exports.ContractEventController = ContractEventController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvY29udHJhY3QtZXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQ0EsbUNBQW1FO0FBQ25FLHdGQUFnRjtBQUNoRix1REFBOEc7QUFDOUcscUNBQTJDO0FBSzNDLElBQWEsdUJBQXVCLEdBQXBDLE1BQWEsdUJBQXVCO0lBR2hDLEdBQUcsQ0FBaUI7SUFFcEIsZUFBZSxDQUFtQjtJQUVsQyx3QkFBd0IsQ0FBMkI7SUFFbkQ7O09BRUc7SUFHSCxLQUFLLENBQUMsT0FBTztRQUVULE1BQU0sRUFBQyxHQUFHLEVBQUMsR0FBRyxJQUFJLENBQUM7UUFDbkIsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDdEUsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDL0QsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzFFLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ2xGLE1BQU0saUJBQWlCLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNyRixHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFckIsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNyRSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ2YsTUFBTSxJQUFJLG1DQUFnQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO1NBQ3hFO1FBRUQsTUFBTSxJQUFJLENBQUMsd0JBQXdCLENBQUMsaUJBQWlCLENBQUMsWUFBWSxFQUFFLHNCQUFlLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdLLENBQUM7SUFFRDs7T0FFRztJQUVILEtBQUssQ0FBQyxPQUFPO1FBQ1QsTUFBTSxFQUFDLEdBQUcsRUFBQyxHQUFHLElBQUksQ0FBQztRQUNuQixNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLEtBQUssQ0FBQztRQUN0RSxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFckIsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNyRSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ2YsTUFBTSxJQUFJLG1DQUFnQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO1NBQ3hFO1FBRUQsTUFBTSxJQUFJLENBQUMsd0JBQXdCLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDeEYsQ0FBQztDQUNKLENBQUE7QUE3Q0c7SUFEQyxJQUFBLGVBQU0sR0FBRTs7b0RBQ1c7QUFFcEI7SUFEQyxJQUFBLGVBQU0sR0FBRTs7Z0VBQ3lCO0FBRWxDO0lBREMsSUFBQSxlQUFNLEdBQUU7OEJBQ2lCLHNEQUF3Qjt5RUFBQztBQU9uRDtJQUZDLElBQUEsMkNBQXdCLEVBQUMsbUNBQWdCLENBQUMsU0FBUyxDQUFDO0lBQ3BELElBQUEsYUFBSSxFQUFDLDZCQUE2QixDQUFDOzs7O3NEQWlCbkM7QUFNRDtJQURDLElBQUEsYUFBSSxFQUFDLDBCQUEwQixDQUFDOzs7O3NEQVloQztBQS9DUSx1QkFBdUI7SUFIbkMsSUFBQSxnQkFBTyxHQUFFO0lBQ1QsSUFBQSxpQkFBUSxFQUFDLENBQUMsQ0FBQztJQUNYLElBQUEsbUJBQVUsRUFBQyxlQUFlLENBQUM7R0FDZix1QkFBdUIsQ0FnRG5DO0FBaERZLDBEQUF1QiJ9