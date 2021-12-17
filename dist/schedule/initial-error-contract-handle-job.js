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
    contractInfoProvider;
    policyInfoProvider;
    buildContractStateMachine;
    async exec(ctx) {
        const initialErrorContracts = await this.contractInfoProvider.find({
            status: egg_freelog_base_1.ContractStatusEnum.Executed,
            fsmRunningStatus: enum_1.ContractFsmRunningStatusEnum.InitializedError
        }, null, { limit: 500, sort: { createDate: 1 } });
        if ((0, lodash_1.isEmpty)(initialErrorContracts)) {
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
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], InitialErrorContractHandleJob.prototype, "contractInfoProvider", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", policy_info_provider_1.default)
], InitialErrorContractHandleJob.prototype, "policyInfoProvider", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Function)
], InitialErrorContractHandleJob.prototype, "buildContractStateMachine", void 0);
InitialErrorContractHandleJob = InitialErrorContractHandleJob_1 = __decorate([
    (0, midway_1.provide)(),
    (0, midway_1.schedule)(InitialErrorContractHandleJob_1.scheduleOptions)
], InitialErrorContractHandleJob);
exports.InitialErrorContractHandleJob = InitialErrorContractHandleJob;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdGlhbC1lcnJvci1jb250cmFjdC1oYW5kbGUtam9iLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NjaGVkdWxlL2luaXRpYWwtZXJyb3ItY29udHJhY3QtaGFuZGxlLWpvYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQStCO0FBQy9CLG1DQUFpRTtBQUNqRSxrQ0FBcUQ7QUFDckQsdURBQW9FO0FBQ3BFLG9GQUEyRTtBQUszRSxJQUFhLDZCQUE2QixxQ0FBMUMsTUFBYSw2QkFBNkI7SUFHdEMsb0JBQW9CLENBQUM7SUFFckIsa0JBQWtCLENBQXFCO0lBRXZDLHlCQUF5QixDQUF3RDtJQUVqRixLQUFLLENBQUMsSUFBSSxDQUFDLEdBQW1CO1FBQzFCLE1BQU0scUJBQXFCLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDO1lBQy9ELE1BQU0sRUFBRSxxQ0FBa0IsQ0FBQyxRQUFRO1lBQ25DLGdCQUFnQixFQUFFLG1DQUE0QixDQUFDLGdCQUFnQjtTQUNsRSxFQUFFLElBQUksRUFBRSxFQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUMsVUFBVSxFQUFFLENBQUMsRUFBQyxFQUFDLENBQUMsQ0FBQztRQUU5QyxJQUFJLElBQUEsZ0JBQU8sRUFBQyxxQkFBcUIsQ0FBQyxFQUFFO1lBQ2hDLE9BQU87U0FDVjtRQUVELE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUFDLFFBQVEsRUFBRSxFQUFDLEdBQUcsRUFBRSxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUMsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzVILE9BQU8sSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkQsQ0FBQyxDQUFDLENBQUM7UUFFSCxLQUFLLE1BQU0sUUFBUSxJQUFJLHFCQUFxQixFQUFFO1lBQzFDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdkQsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3JFLE1BQU0sT0FBTyxDQUFDLGVBQWUsQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDckMsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNqQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFO2dCQUNaLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN6QixDQUFDLENBQUMsQ0FBQztTQUNOO0lBQ0wsQ0FBQztJQUVELE1BQU0sS0FBSyxlQUFlO1FBQ3RCLE9BQU87WUFDSCxJQUFJLEVBQUUsZUFBZTtZQUNyQixJQUFJLEVBQUUsUUFBUTtZQUNkLFNBQVMsRUFBRSxJQUFJO1lBQ2YsT0FBTyxFQUFFLEtBQUs7U0FDakIsQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFBO0FBeENHO0lBREMsSUFBQSxlQUFNLEdBQUU7OzJFQUNZO0FBRXJCO0lBREMsSUFBQSxlQUFNLEdBQUU7OEJBQ1csOEJBQWtCO3lFQUFDO0FBRXZDO0lBREMsSUFBQSxlQUFNLEdBQUU7O2dGQUN3RTtBQVB4RSw2QkFBNkI7SUFGekMsSUFBQSxnQkFBTyxHQUFFO0lBQ1QsSUFBQSxpQkFBUSxFQUFDLCtCQUE2QixDQUFDLGVBQWUsQ0FBQztHQUMzQyw2QkFBNkIsQ0EyQ3pDO0FBM0NZLHNFQUE2QiJ9