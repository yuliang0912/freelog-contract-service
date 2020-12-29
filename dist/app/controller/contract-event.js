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
const egg_freelog_base_1 = require("egg-freelog-base");
let ContractEventController = class ContractEventController {
    async execContractEvent() {
        const { ctx } = this;
        const contractId = ctx.checkParams('contractId').isContractId().value;
        const eventId = ctx.checkBody('eventId').exist().isMd5().value;
        ctx.validateParams();
        const contractInfo = await this.contractService.findById(contractId);
        if (!contractInfo) {
            throw new egg_freelog_base_1.ApplicationError(ctx.gettext('contract-entity-not-found'));
        }
        if (contractInfo.licenseeOwnerId !== ctx.userId || contractInfo.licensorOwnerId !== ctx.userId) {
            throw new egg_freelog_base_1.AuthorizationError(ctx.gettext('user-authorization-failed'));
        }
        const policyInfo = await this.policyService.findOne({ policyId: contractInfo.policyId });
        const currentStateFsmDeclaration = policyInfo.fsmDescriptionInfo[contractInfo.fsmCurrentState];
        let currentEventInfo;
        for (const [_, policyEventInfo] of Object.entries(currentStateFsmDeclaration.transition)) {
            if (policyEventInfo?.eventId === eventId) {
                currentEventInfo = policyEventInfo;
                break;
            }
        }
        if (!currentEventInfo) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-validate-failed', 'eventId'));
        }
        // 根据合同当前的状态描述,然后找出对应的事件信息,然后根据事件类型去做不同的参数校验以及细分的执行权限校验
        ctx.success({ currentEventInfo, eventId });
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractEventController.prototype, "ctx", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractEventController.prototype, "policyService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractEventController.prototype, "contractService", void 0);
__decorate([
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    midway_1.post('/:contractId/execEvent'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractEventController.prototype, "execContractEvent", null);
ContractEventController = __decorate([
    midway_1.provide(),
    midway_1.controller('/v2/contracts')
], ContractEventController);
exports.ContractEventController = ContractEventController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvY29udHJhY3QtZXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQXlEO0FBRXpELHVEQUcwQjtBQUkxQixJQUFhLHVCQUF1QixHQUFwQyxNQUFhLHVCQUF1QjtJQVdoQyxLQUFLLENBQUMsaUJBQWlCO1FBRW5CLE1BQU0sRUFBQyxHQUFHLEVBQUMsR0FBRyxJQUFJLENBQUM7UUFDbkIsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDdEUsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDL0QsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXJCLE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckUsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNmLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQztTQUN4RTtRQUNELElBQUksWUFBWSxDQUFDLGVBQWUsS0FBSyxHQUFHLENBQUMsTUFBTSxJQUFJLFlBQVksQ0FBQyxlQUFlLEtBQUssR0FBRyxDQUFDLE1BQU0sRUFBRTtZQUM1RixNQUFNLElBQUkscUNBQWtCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7U0FDMUU7UUFFRCxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDO1FBQ3ZGLE1BQU0sMEJBQTBCLEdBQUcsVUFBVSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUUvRixJQUFJLGdCQUFpQyxDQUFDO1FBQ3RDLEtBQUssTUFBTSxDQUFDLENBQUMsRUFBRSxlQUFlLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLDBCQUEwQixDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ3RGLElBQUksZUFBZSxFQUFFLE9BQU8sS0FBSyxPQUFPLEVBQUU7Z0JBQ3RDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQztnQkFDbkMsTUFBTTthQUNUO1NBQ0o7UUFDRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7WUFDbkIsTUFBTSxJQUFJLGdDQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1NBQzdFO1FBRUQsdURBQXVEO1FBQ3ZELEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBQyxnQkFBZ0IsRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFDO0lBQzdDLENBQUM7Q0FDSixDQUFBO0FBeENHO0lBREMsZUFBTSxFQUFFOztvREFDVztBQUVwQjtJQURDLGVBQU0sRUFBRTs7OERBQ3FCO0FBRTlCO0lBREMsZUFBTSxFQUFFOztnRUFDeUI7QUFJbEM7SUFGQywyQ0FBd0IsQ0FBQyxtQ0FBZ0IsQ0FBQyxTQUFTLENBQUM7SUFDcEQsYUFBSSxDQUFDLHdCQUF3QixDQUFDOzs7O2dFQWdDOUI7QUExQ1EsdUJBQXVCO0lBRm5DLGdCQUFPLEVBQUU7SUFDVCxtQkFBVSxDQUFDLGVBQWUsQ0FBQztHQUNmLHVCQUF1QixDQTJDbkM7QUEzQ1ksMERBQXVCIn0=