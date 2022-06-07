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
var ContractEventRegisterFailedHandleJob_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractEventRegisterFailedHandleJob = void 0;
const midway_1 = require("midway");
const policy_info_provider_1 = require("../app/data-provider/policy-info-provider");
const contract_info_provider_1 = require("../app/data-provider/contract-info-provider");
const enum_1 = require("../enum");
const contract_fsm_event_transition_after_handler_1 = require("../contract-fsm-service/contract-fsm-event-transition-after-handler");
const lodash_1 = require("lodash");
let ContractEventRegisterFailedHandleJob = ContractEventRegisterFailedHandleJob_1 = class ContractEventRegisterFailedHandleJob {
    policyInfoProvider;
    contractInfoProvider;
    contractFsmEventTransitionAfterHandler;
    async exec(ctx) {
        const registerFailedContracts = await this.contractInfoProvider.find({
            fsmRunningStatus: enum_1.ContractFsmRunningStatusEnum.ToBeRegisteredEvents
        }, null, { limit: 500, sort: { _id: 1 } });
        if ((0, lodash_1.isEmpty)(registerFailedContracts)) {
            return;
        }
        const policyMap = await this.policyInfoProvider.find({ policyId: { $in: registerFailedContracts.map(x => x.policyId) } }).then(list => {
            return new Map(list.map(x => [x.policyId, x]));
        });
        for (const contractInfo of registerFailedContracts) {
            contractInfo.policyInfo = policyMap.get(contractInfo.policyId);
            const toBeRegisterEventInfos = this.contractFsmEventTransitionAfterHandler.getCanRegisterEvents(contractInfo, contractInfo.fsmCurrentState);
            const eventBody = toBeRegisterEventInfos.map(eventInfo => (0, lodash_1.pick)(eventInfo, ['service', 'name', 'code', 'eventId', 'args']));
            this.contractFsmEventTransitionAfterHandler.sendContractRegisterEventToKafka(contractInfo, eventBody).then(() => {
                return this.contractInfoProvider.updateOne({ _id: contractInfo.contractId }, {
                    fsmRunningStatus: enum_1.ContractFsmRunningStatusEnum.Running
                });
            }).catch(() => null);
        }
    }
    static get scheduleOptions() {
        return {
            cron: '0 */2 * * * *',
            type: 'worker',
            immediate: false,
            disable: false
        };
    }
};
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", policy_info_provider_1.default)
], ContractEventRegisterFailedHandleJob.prototype, "policyInfoProvider", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", contract_info_provider_1.default)
], ContractEventRegisterFailedHandleJob.prototype, "contractInfoProvider", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", contract_fsm_event_transition_after_handler_1.ContractFsmEventTransitionAfterHandler)
], ContractEventRegisterFailedHandleJob.prototype, "contractFsmEventTransitionAfterHandler", void 0);
ContractEventRegisterFailedHandleJob = ContractEventRegisterFailedHandleJob_1 = __decorate([
    (0, midway_1.provide)(),
    (0, midway_1.schedule)(ContractEventRegisterFailedHandleJob_1.scheduleOptions)
], ContractEventRegisterFailedHandleJob);
exports.ContractEventRegisterFailedHandleJob = ContractEventRegisterFailedHandleJob;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZXZlbnQtcmVnaXN0ZXItZmFpbGVkLWhhbmRsZS1qb2IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2NoZWR1bGUvY29udHJhY3QtZXZlbnQtcmVnaXN0ZXItZmFpbGVkLWhhbmRsZS1qb2IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBLG1DQUFpRTtBQUVqRSxvRkFBMkU7QUFDM0Usd0ZBQStFO0FBQy9FLGtDQUFxRDtBQUNyRCxxSUFBMkg7QUFDM0gsbUNBQXFDO0FBSXJDLElBQWEsb0NBQW9DLDRDQUFqRCxNQUFhLG9DQUFvQztJQUc3QyxrQkFBa0IsQ0FBcUI7SUFFdkMsb0JBQW9CLENBQXVCO0lBRTNDLHNDQUFzQyxDQUF5QztJQUUvRSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQW1CO1FBQzFCLE1BQU0sdUJBQXVCLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDO1lBQ2pFLGdCQUFnQixFQUFFLG1DQUE0QixDQUFDLG9CQUFvQjtTQUN0RSxFQUFFLElBQUksRUFBRSxFQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUMsR0FBRyxFQUFFLENBQUMsRUFBQyxFQUFDLENBQUMsQ0FBQztRQUV2QyxJQUFJLElBQUEsZ0JBQU8sRUFBQyx1QkFBdUIsQ0FBQyxFQUFFO1lBQ2xDLE9BQU87U0FDVjtRQUVELE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUFDLFFBQVEsRUFBRSxFQUFDLEdBQUcsRUFBRSx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUMsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzlILE9BQU8sSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkQsQ0FBQyxDQUFDLENBQUM7UUFFSCxLQUFLLE1BQU0sWUFBWSxJQUFJLHVCQUF1QixFQUFFO1lBQ2hELFlBQVksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDL0QsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsc0NBQXNDLENBQUMsb0JBQW9CLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUM1SSxNQUFNLFNBQVMsR0FBRyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFBLGFBQUksRUFBQyxTQUFTLEVBQUUsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNILElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxnQ0FBZ0MsQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDNUcsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLEVBQUMsR0FBRyxFQUFFLFlBQVksQ0FBQyxVQUFVLEVBQUMsRUFBRTtvQkFDdkUsZ0JBQWdCLEVBQUUsbUNBQTRCLENBQUMsT0FBTztpQkFDekQsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO0lBQ0wsQ0FBQztJQUVELE1BQU0sS0FBSyxlQUFlO1FBQ3RCLE9BQU87WUFDSCxJQUFJLEVBQUUsZUFBZTtZQUNyQixJQUFJLEVBQUUsUUFBUTtZQUNkLFNBQVMsRUFBRSxLQUFLO1lBQ2hCLE9BQU8sRUFBRSxLQUFLO1NBQ2pCLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQTtBQXZDRztJQURDLElBQUEsZUFBTSxHQUFFOzhCQUNXLDhCQUFrQjtnRkFBQztBQUV2QztJQURDLElBQUEsZUFBTSxHQUFFOzhCQUNhLGdDQUFvQjtrRkFBQztBQUUzQztJQURDLElBQUEsZUFBTSxHQUFFOzhCQUMrQixvRkFBc0M7b0dBQUM7QUFQdEUsb0NBQW9DO0lBRmhELElBQUEsZ0JBQU8sR0FBRTtJQUNULElBQUEsaUJBQVEsRUFBQyxzQ0FBb0MsQ0FBQyxlQUFlLENBQUM7R0FDbEQsb0NBQW9DLENBMENoRDtBQTFDWSxvRkFBb0MifQ==