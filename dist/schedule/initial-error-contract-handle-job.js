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
var InitialErrorContractHandleJob_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialErrorContractHandleJob = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const enum_1 = require("../enum");
const egg_freelog_base_1 = require("egg-freelog-base");
const policy_info_provider_1 = require("../app/data-provider/policy-info-provider");
let InitialErrorContractHandleJob = InitialErrorContractHandleJob_1 = class InitialErrorContractHandleJob {
    async exec(ctx) {
        const initialErrorContracts = await this.contractInfoProvider.find({
            status: egg_freelog_base_1.ContractStatusEnum.Executed,
            fsmRunningStatus: enum_1.ContractFsmRunningStatusEnum.InitializedError
        }, null, { limit: 500, sort: { createDate: 1 } });
        if (lodash_1.isEmpty(initialErrorContracts)) {
            return;
        }
        const policyMap = await this.policyInfoProvider.find({ policyId: { $in: initialErrorContracts.map(x => x.policyId) } }).then(list => {
            return new Map(list.map(x => [x.policyId, x]));
        });
        for (const contract of initialErrorContracts) {
            contract.policyInfo = policyMap.get(contract.policyId);
            const session = await this.contractInfoProvider.model.startSession();
            await session.withTransaction(async () => {
                return this.buildContractStateMachine(contract).execInitial(session);
            }).catch(error => {
            }).finally(() => {
                session.endSession();
            });
        }
    }
    static get scheduleOptions() {
        return {
            cron: '0 */5 * * * *',
            type: 'worker',
            immediate: true,
            disable: false
        };
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], InitialErrorContractHandleJob.prototype, "contractInfoProvider", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", policy_info_provider_1.default)
], InitialErrorContractHandleJob.prototype, "policyInfoProvider", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Function)
], InitialErrorContractHandleJob.prototype, "buildContractStateMachine", void 0);
InitialErrorContractHandleJob = InitialErrorContractHandleJob_1 = __decorate([
    midway_1.provide(),
    midway_1.schedule(InitialErrorContractHandleJob_1.scheduleOptions)
], InitialErrorContractHandleJob);
exports.InitialErrorContractHandleJob = InitialErrorContractHandleJob;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdGlhbC1lcnJvci1jb250cmFjdC1oYW5kbGUtam9iLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NjaGVkdWxlL2luaXRpYWwtZXJyb3ItY29udHJhY3QtaGFuZGxlLWpvYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQStCO0FBQy9CLG1DQUFpRTtBQUNqRSxrQ0FBcUQ7QUFDckQsdURBQW9FO0FBQ3BFLG9GQUEyRTtBQUszRSxJQUFhLDZCQUE2QixxQ0FBMUMsTUFBYSw2QkFBNkI7SUFTdEMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFtQjtRQUMxQixNQUFNLHFCQUFxQixHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQztZQUMvRCxNQUFNLEVBQUUscUNBQWtCLENBQUMsUUFBUTtZQUNuQyxnQkFBZ0IsRUFBRSxtQ0FBNEIsQ0FBQyxnQkFBZ0I7U0FDbEUsRUFBRSxJQUFJLEVBQUUsRUFBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUMsRUFBQyxDQUFDLENBQUM7UUFFOUMsSUFBSSxnQkFBTyxDQUFDLHFCQUFxQixDQUFDLEVBQUU7WUFDaEMsT0FBTztTQUNWO1FBRUQsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEVBQUMsUUFBUSxFQUFFLEVBQUMsR0FBRyxFQUFFLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBQyxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDNUgsT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuRCxDQUFDLENBQUMsQ0FBQztRQUVILEtBQUssTUFBTSxRQUFRLElBQUkscUJBQXFCLEVBQUU7WUFDMUMsUUFBUSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2RCxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDckUsTUFBTSxPQUFPLENBQUMsZUFBZSxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUNyQyxPQUFPLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDekUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2pCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7Z0JBQ1osT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxDQUFDO1NBQ047SUFDTCxDQUFDO0lBRUQsTUFBTSxLQUFLLGVBQWU7UUFDdEIsT0FBTztZQUNILElBQUksRUFBRSxlQUFlO1lBQ3JCLElBQUksRUFBRSxRQUFRO1lBQ2QsU0FBUyxFQUFFLElBQUk7WUFDZixPQUFPLEVBQUUsS0FBSztTQUNqQixDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUE7QUF4Q0c7SUFEQyxlQUFNLEVBQUU7OzJFQUNZO0FBRXJCO0lBREMsZUFBTSxFQUFFOzhCQUNXLDhCQUFrQjt5RUFBQztBQUV2QztJQURDLGVBQU0sRUFBRTs7Z0ZBQ3dFO0FBUHhFLDZCQUE2QjtJQUZ6QyxnQkFBTyxFQUFFO0lBQ1QsaUJBQVEsQ0FBQywrQkFBNkIsQ0FBQyxlQUFlLENBQUM7R0FDM0MsNkJBQTZCLENBMkN6QztBQTNDWSxzRUFBNkIifQ==