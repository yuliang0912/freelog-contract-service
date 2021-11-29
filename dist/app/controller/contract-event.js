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
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractEventController.prototype, "ctx", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractEventController.prototype, "contractService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", contract_event_exec_service_1.ContractEventExecService)
], ContractEventController.prototype, "contractEventExecService", void 0);
__decorate([
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    midway_1.post('/:contractId/events/payment'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractEventController.prototype, "payment", null);
__decorate([
    midway_1.post('/:contractId/events/init'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractEventController.prototype, "initial", null);
ContractEventController = __decorate([
    midway_1.provide(),
    midway_1.priority(1),
    midway_1.controller('/v2/contracts')
], ContractEventController);
exports.ContractEventController = ContractEventController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvY29udHJhY3QtZXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQ0EsbUNBQW1FO0FBQ25FLHdGQUFnRjtBQUNoRix1REFBOEc7QUFDOUcscUNBQTJDO0FBSzNDLElBQWEsdUJBQXVCLEdBQXBDLE1BQWEsdUJBQXVCO0lBU2hDOztPQUVHO0lBR0gsS0FBSyxDQUFDLE9BQU87UUFFVCxNQUFNLEVBQUMsR0FBRyxFQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ25CLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ3RFLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQy9ELE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUMxRSxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUNsRixNQUFNLGlCQUFpQixHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDckYsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXJCLE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckUsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNmLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQztTQUN4RTtRQUVELE1BQU0sSUFBSSxDQUFDLHdCQUF3QixDQUFDLGlCQUFpQixDQUFDLFlBQVksRUFBRSxzQkFBZSxDQUFDLGdCQUFnQixFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM3SyxDQUFDO0lBRUQ7O09BRUc7SUFFSCxLQUFLLENBQUMsT0FBTztRQUNULE1BQU0sRUFBQyxHQUFHLEVBQUMsR0FBRyxJQUFJLENBQUM7UUFDbkIsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDdEUsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXJCLE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckUsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNmLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQztTQUN4RTtRQUVELE1BQU0sSUFBSSxDQUFDLHdCQUF3QixDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3hGLENBQUM7Q0FDSixDQUFBO0FBN0NHO0lBREMsZUFBTSxFQUFFOztvREFDVztBQUVwQjtJQURDLGVBQU0sRUFBRTs7Z0VBQ3lCO0FBRWxDO0lBREMsZUFBTSxFQUFFOzhCQUNpQixzREFBd0I7eUVBQUM7QUFPbkQ7SUFGQywyQ0FBd0IsQ0FBQyxtQ0FBZ0IsQ0FBQyxTQUFTLENBQUM7SUFDcEQsYUFBSSxDQUFDLDZCQUE2QixDQUFDOzs7O3NEQWlCbkM7QUFNRDtJQURDLGFBQUksQ0FBQywwQkFBMEIsQ0FBQzs7OztzREFZaEM7QUEvQ1EsdUJBQXVCO0lBSG5DLGdCQUFPLEVBQUU7SUFDVCxpQkFBUSxDQUFDLENBQUMsQ0FBQztJQUNYLG1CQUFVLENBQUMsZUFBZSxDQUFDO0dBQ2YsdUJBQXVCLENBZ0RuQztBQWhEWSwwREFBdUIifQ==