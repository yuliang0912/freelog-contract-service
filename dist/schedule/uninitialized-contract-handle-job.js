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
var UninitializedContractHandleJob_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UninitializedContractHandleJob = void 0;
const lodash_1 = require("lodash");
const enum_1 = require("../enum");
const egg_freelog_base_1 = require("egg-freelog-base");
const midway_1 = require("midway");
const policy_info_provider_1 = require("../app/data-provider/policy-info-provider");
const mongodb_1 = require("mongodb");
let UninitializedContractHandleJob = UninitializedContractHandleJob_1 = class UninitializedContractHandleJob {
    async exec(ctx) {
        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() - 3);
        const uninitializedContracts = await this.contractInfoProvider.find({
            status: egg_freelog_base_1.ContractStatusEnum.Executed,
            fsmRunningStatus: enum_1.ContractFsmRunningStatusEnum.Uninitialized,
            createDate: { $lt: expirationDate }
        }, null, { limit: 500, sort: { createDate: 1 } });
        if (lodash_1.isEmpty(uninitializedContracts)) {
            return;
        }
        const policyMap = await this.policyInfoProvider.find({ policyId: { $in: uninitializedContracts.map(x => x.policyId) } }).then(list => {
            return new Map(list.map(x => [x.policyId, x]));
        });
        for (const contract of uninitializedContracts) {
            contract.policyInfo = policyMap.get(contract.policyId);
            const session = await this.mongoose.startSession();
            await session.withTransaction(async () => {
                return this.buildContractStateMachine(contract).execInitial(session);
            }).catch(() => {
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
    midway_1.plugin(),
    __metadata("design:type", mongodb_1.MongoClient)
], UninitializedContractHandleJob.prototype, "mongoose", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], UninitializedContractHandleJob.prototype, "contractInfoProvider", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", policy_info_provider_1.default)
], UninitializedContractHandleJob.prototype, "policyInfoProvider", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Function)
], UninitializedContractHandleJob.prototype, "buildContractStateMachine", void 0);
UninitializedContractHandleJob = UninitializedContractHandleJob_1 = __decorate([
    midway_1.provide(),
    midway_1.schedule(UninitializedContractHandleJob_1.scheduleOptions)
], UninitializedContractHandleJob);
exports.UninitializedContractHandleJob = UninitializedContractHandleJob;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5pbml0aWFsaXplZC1jb250cmFjdC1oYW5kbGUtam9iLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NjaGVkdWxlL3VuaW5pdGlhbGl6ZWQtY29udHJhY3QtaGFuZGxlLWpvYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQStCO0FBQy9CLGtDQUFxRDtBQUNyRCx1REFBb0Q7QUFDcEQsbUNBQXlFO0FBQ3pFLG9GQUEyRTtBQUUzRSxxQ0FBb0M7QUFJcEMsSUFBYSw4QkFBOEIsc0NBQTNDLE1BQWEsOEJBQThCO0lBV3ZDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRztRQUVWLE1BQU0sY0FBYyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDbEMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFM0QsTUFBTSxzQkFBc0IsR0FBRyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUM7WUFDaEUsTUFBTSxFQUFFLHFDQUFrQixDQUFDLFFBQVE7WUFDbkMsZ0JBQWdCLEVBQUUsbUNBQTRCLENBQUMsYUFBYTtZQUM1RCxVQUFVLEVBQUUsRUFBQyxHQUFHLEVBQUUsY0FBYyxFQUFDO1NBQ3BDLEVBQUUsSUFBSSxFQUFFLEVBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBQyxVQUFVLEVBQUUsQ0FBQyxFQUFDLEVBQUMsQ0FBQyxDQUFDO1FBRTlDLElBQUksZ0JBQU8sQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFO1lBQ2pDLE9BQU87U0FDVjtRQUVELE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUFDLFFBQVEsRUFBRSxFQUFDLEdBQUcsRUFBRSxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUMsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzdILE9BQU8sSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkQsQ0FBQyxDQUFDLENBQUM7UUFDSCxLQUFLLE1BQU0sUUFBUSxJQUFJLHNCQUFzQixFQUFFO1lBQzNDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdkQsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ25ELE1BQU0sT0FBTyxDQUFDLGVBQWUsQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDckMsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDZCxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFO2dCQUNaLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN6QixDQUFDLENBQUMsQ0FBQztTQUNOO0lBQ0wsQ0FBQztJQUVELE1BQU0sS0FBSyxlQUFlO1FBQ3RCLE9BQU87WUFDSCxJQUFJLEVBQUUsZUFBZTtZQUNyQixJQUFJLEVBQUUsUUFBUTtZQUNkLFNBQVMsRUFBRSxJQUFJO1lBQ2YsT0FBTyxFQUFFLEtBQUs7U0FDakIsQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFBO0FBOUNHO0lBREMsZUFBTSxFQUFFOzhCQUNDLHFCQUFXO2dFQUFDO0FBRXRCO0lBREMsZUFBTSxFQUFFOzs0RUFDWTtBQUVyQjtJQURDLGVBQU0sRUFBRTs4QkFDVyw4QkFBa0I7MEVBQUM7QUFFdkM7SUFEQyxlQUFNLEVBQUU7O2lGQUN3RTtBQVR4RSw4QkFBOEI7SUFGMUMsZ0JBQU8sRUFBRTtJQUNULGlCQUFRLENBQUMsZ0NBQThCLENBQUMsZUFBZSxDQUFDO0dBQzVDLDhCQUE4QixDQWlEMUM7QUFqRFksd0VBQThCIn0=