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
    mongoose;
    contractInfoProvider;
    policyInfoProvider;
    buildContractStateMachine;
    async exec(ctx) {
        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() - 3);
        const uninitializedContracts = await this.contractInfoProvider.find({
            status: egg_freelog_base_1.ContractStatusEnum.Executed,
            fsmRunningStatus: enum_1.ContractFsmRunningStatusEnum.Uninitialized,
            createDate: { $lt: expirationDate }
        }, null, { limit: 500, sort: { createDate: 1 } });
        if ((0, lodash_1.isEmpty)(uninitializedContracts)) {
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
    (0, midway_1.plugin)(),
    __metadata("design:type", mongodb_1.MongoClient)
], UninitializedContractHandleJob.prototype, "mongoose", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], UninitializedContractHandleJob.prototype, "contractInfoProvider", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", policy_info_provider_1.default)
], UninitializedContractHandleJob.prototype, "policyInfoProvider", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Function)
], UninitializedContractHandleJob.prototype, "buildContractStateMachine", void 0);
UninitializedContractHandleJob = UninitializedContractHandleJob_1 = __decorate([
    (0, midway_1.provide)(),
    (0, midway_1.schedule)(UninitializedContractHandleJob_1.scheduleOptions)
], UninitializedContractHandleJob);
exports.UninitializedContractHandleJob = UninitializedContractHandleJob;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5pbml0aWFsaXplZC1jb250cmFjdC1oYW5kbGUtam9iLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NjaGVkdWxlL3VuaW5pdGlhbGl6ZWQtY29udHJhY3QtaGFuZGxlLWpvYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQStCO0FBQy9CLGtDQUFxRDtBQUNyRCx1REFBb0Q7QUFDcEQsbUNBQXlFO0FBQ3pFLG9GQUEyRTtBQUUzRSxxQ0FBb0M7QUFJcEMsSUFBYSw4QkFBOEIsc0NBQTNDLE1BQWEsOEJBQThCO0lBR3ZDLFFBQVEsQ0FBYztJQUV0QixvQkFBb0IsQ0FBQztJQUVyQixrQkFBa0IsQ0FBcUI7SUFFdkMseUJBQXlCLENBQXdEO0lBRWpGLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRztRQUVWLE1BQU0sY0FBYyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDbEMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFM0QsTUFBTSxzQkFBc0IsR0FBRyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUM7WUFDaEUsTUFBTSxFQUFFLHFDQUFrQixDQUFDLFFBQVE7WUFDbkMsZ0JBQWdCLEVBQUUsbUNBQTRCLENBQUMsYUFBYTtZQUM1RCxVQUFVLEVBQUUsRUFBQyxHQUFHLEVBQUUsY0FBYyxFQUFDO1NBQ3BDLEVBQUUsSUFBSSxFQUFFLEVBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBQyxVQUFVLEVBQUUsQ0FBQyxFQUFDLEVBQUMsQ0FBQyxDQUFDO1FBRTlDLElBQUksSUFBQSxnQkFBTyxFQUFDLHNCQUFzQixDQUFDLEVBQUU7WUFDakMsT0FBTztTQUNWO1FBRUQsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEVBQUMsUUFBUSxFQUFFLEVBQUMsR0FBRyxFQUFFLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBQyxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDN0gsT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuRCxDQUFDLENBQUMsQ0FBQztRQUNILEtBQUssTUFBTSxRQUFRLElBQUksc0JBQXNCLEVBQUU7WUFDM0MsUUFBUSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2RCxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDbkQsTUFBTSxPQUFPLENBQUMsZUFBZSxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUNyQyxPQUFPLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDekUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNkLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7Z0JBQ1osT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxDQUFDO1NBQ047SUFDTCxDQUFDO0lBRUQsTUFBTSxLQUFLLGVBQWU7UUFDdEIsT0FBTztZQUNILElBQUksRUFBRSxlQUFlO1lBQ3JCLElBQUksRUFBRSxRQUFRO1lBQ2QsU0FBUyxFQUFFLElBQUk7WUFDZixPQUFPLEVBQUUsS0FBSztTQUNqQixDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUE7QUE5Q0c7SUFEQyxJQUFBLGVBQU0sR0FBRTs4QkFDQyxxQkFBVztnRUFBQztBQUV0QjtJQURDLElBQUEsZUFBTSxHQUFFOzs0RUFDWTtBQUVyQjtJQURDLElBQUEsZUFBTSxHQUFFOzhCQUNXLDhCQUFrQjswRUFBQztBQUV2QztJQURDLElBQUEsZUFBTSxHQUFFOztpRkFDd0U7QUFUeEUsOEJBQThCO0lBRjFDLElBQUEsZ0JBQU8sR0FBRTtJQUNULElBQUEsaUJBQVEsRUFBQyxnQ0FBOEIsQ0FBQyxlQUFlLENBQUM7R0FDNUMsOEJBQThCLENBaUQxQztBQWpEWSx3RUFBOEIifQ==