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
    async exec(ctx) {
        const registerFailedContracts = await this.contractInfoProvider.find({
            fsmRunningStatus: enum_1.ContractFsmRunningStatusEnum.ToBeRegisteredEvents
        }, null, { limit: 500, sort: { _id: 1 } });
        if (lodash_1.isEmpty(registerFailedContracts)) {
            return;
        }
        const policyMap = await this.policyInfoProvider.find({ policyId: { $in: registerFailedContracts.map(x => x.policyId) } }).then(list => {
            return new Map(list.map(x => [x.policyId, x]));
        });
        for (const contractInfo of registerFailedContracts) {
            contractInfo.policyInfo = policyMap.get(contractInfo.policyId);
            const toBeRegisterEventInfos = this.contractFsmEventTransitionAfterHandler.getCanRegisterEvents(contractInfo, contractInfo.fsmCurrentState);
            const eventBody = toBeRegisterEventInfos.map(eventInfo => lodash_1.pick(eventInfo, ['service', 'name', 'code', 'eventId', 'args']));
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
            immediate: true,
            disable: false
        };
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", policy_info_provider_1.default)
], ContractEventRegisterFailedHandleJob.prototype, "policyInfoProvider", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", contract_info_provider_1.default)
], ContractEventRegisterFailedHandleJob.prototype, "contractInfoProvider", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", contract_fsm_event_transition_after_handler_1.ContractFsmEventTransitionAfterHandler)
], ContractEventRegisterFailedHandleJob.prototype, "contractFsmEventTransitionAfterHandler", void 0);
ContractEventRegisterFailedHandleJob = ContractEventRegisterFailedHandleJob_1 = __decorate([
    midway_1.provide(),
    midway_1.schedule(ContractEventRegisterFailedHandleJob_1.scheduleOptions)
], ContractEventRegisterFailedHandleJob);
exports.ContractEventRegisterFailedHandleJob = ContractEventRegisterFailedHandleJob;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZXZlbnQtcmVnaXN0ZXItZmFpbGVkLWhhbmRsZS1qb2IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2NoZWR1bGUvY29udHJhY3QtZXZlbnQtcmVnaXN0ZXItZmFpbGVkLWhhbmRsZS1qb2IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBLG1DQUFpRTtBQUVqRSxvRkFBMkU7QUFDM0Usd0ZBQStFO0FBQy9FLGtDQUFxRDtBQUNyRCxxSUFBMkg7QUFDM0gsbUNBQXFDO0FBSXJDLElBQWEsb0NBQW9DLDRDQUFqRCxNQUFhLG9DQUFvQztJQVM3QyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQW1CO1FBQzFCLE1BQU0sdUJBQXVCLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDO1lBQ2pFLGdCQUFnQixFQUFFLG1DQUE0QixDQUFDLG9CQUFvQjtTQUN0RSxFQUFFLElBQUksRUFBRSxFQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUMsR0FBRyxFQUFFLENBQUMsRUFBQyxFQUFDLENBQUMsQ0FBQztRQUV2QyxJQUFJLGdCQUFPLENBQUMsdUJBQXVCLENBQUMsRUFBRTtZQUNsQyxPQUFPO1NBQ1Y7UUFFRCxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBQyxRQUFRLEVBQUUsRUFBQyxHQUFHLEVBQUUsdUJBQXVCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFDLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM5SCxPQUFPLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQyxDQUFDO1FBRUgsS0FBSyxNQUFNLFlBQVksSUFBSSx1QkFBdUIsRUFBRTtZQUNoRCxZQUFZLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQy9ELE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLG9CQUFvQixDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDNUksTUFBTSxTQUFTLEdBQUcsc0JBQXNCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsYUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0gsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLGdDQUFnQyxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUM1RyxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsRUFBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLFVBQVUsRUFBQyxFQUFFO29CQUN2RSxnQkFBZ0IsRUFBRSxtQ0FBNEIsQ0FBQyxPQUFPO2lCQUN6RCxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7SUFDTCxDQUFDO0lBRUQsTUFBTSxLQUFLLGVBQWU7UUFDdEIsT0FBTztZQUNILElBQUksRUFBRSxlQUFlO1lBQ3JCLElBQUksRUFBRSxRQUFRO1lBQ2QsU0FBUyxFQUFFLElBQUk7WUFDZixPQUFPLEVBQUUsS0FBSztTQUNqQixDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUE7QUF2Q0c7SUFEQyxlQUFNLEVBQUU7OEJBQ1csOEJBQWtCO2dGQUFDO0FBRXZDO0lBREMsZUFBTSxFQUFFOzhCQUNhLGdDQUFvQjtrRkFBQztBQUUzQztJQURDLGVBQU0sRUFBRTs4QkFDK0Isb0ZBQXNDO29HQUFDO0FBUHRFLG9DQUFvQztJQUZoRCxnQkFBTyxFQUFFO0lBQ1QsaUJBQVEsQ0FBQyxzQ0FBb0MsQ0FBQyxlQUFlLENBQUM7R0FDbEQsb0NBQW9DLENBMENoRDtBQTFDWSxvRkFBb0MifQ==