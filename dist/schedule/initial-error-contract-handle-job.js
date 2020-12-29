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
let InitialErrorContractHandleJob = InitialErrorContractHandleJob_1 = class InitialErrorContractHandleJob {
    async exec(ctx) {
        const initialErrorContracts = await this.contractInfoProvider.find({
            status: egg_freelog_base_1.ContractStatusEnum.Executed,
            fsmRunningStatus: enum_1.ContractFsmRunningStatusEnum.InitializedError
        }, null, { limit: 500, sort: { createDate: 1 } });
        if (!lodash_1.isEmpty(initialErrorContracts)) {
            await this.contractEventHandler.handle(enum_1.ContractEventEnum.InitialContractFsmEvent, initialErrorContracts);
        }
    }
    static get scheduleOptions() {
        return {
            cron: '*/5 * * * * *',
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
    __metadata("design:type", Object)
], InitialErrorContractHandleJob.prototype, "contractEventHandler", void 0);
InitialErrorContractHandleJob = InitialErrorContractHandleJob_1 = __decorate([
    midway_1.provide(),
    midway_1.schedule(InitialErrorContractHandleJob_1.scheduleOptions)
], InitialErrorContractHandleJob);
exports.InitialErrorContractHandleJob = InitialErrorContractHandleJob;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdGlhbC1lcnJvci1jb250cmFjdC1oYW5kbGUtam9iLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NjaGVkdWxlL2luaXRpYWwtZXJyb3ItY29udHJhY3QtaGFuZGxlLWpvYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQStCO0FBRS9CLG1DQUFpRTtBQUNqRSxrQ0FBd0U7QUFDeEUsdURBQW9EO0FBSXBELElBQWEsNkJBQTZCLHFDQUExQyxNQUFhLDZCQUE2QjtJQU90QyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUc7UUFDVixNQUFNLHFCQUFxQixHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQztZQUMvRCxNQUFNLEVBQUUscUNBQWtCLENBQUMsUUFBUTtZQUNuQyxnQkFBZ0IsRUFBRSxtQ0FBNEIsQ0FBQyxnQkFBZ0I7U0FDbEUsRUFBRSxJQUFJLEVBQUUsRUFBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUMsRUFBQyxDQUFDLENBQUM7UUFFOUMsSUFBSSxDQUFDLGdCQUFPLENBQUMscUJBQXFCLENBQUMsRUFBRTtZQUNqQyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsd0JBQWlCLENBQUMsdUJBQXVCLEVBQUUscUJBQXFCLENBQUMsQ0FBQztTQUM1RztJQUNMLENBQUM7SUFFRCxNQUFNLEtBQUssZUFBZTtRQUN0QixPQUFPO1lBQ0gsSUFBSSxFQUFFLGVBQWU7WUFDckIsSUFBSSxFQUFFLFFBQVE7WUFDZCxTQUFTLEVBQUUsSUFBSTtZQUNmLE9BQU8sRUFBRSxLQUFLO1NBQ2pCLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQTtBQXZCRztJQURDLGVBQU0sRUFBRTs7MkVBQ1k7QUFFckI7SUFEQyxlQUFNLEVBQUU7OzJFQUNtQztBQUxuQyw2QkFBNkI7SUFGekMsZ0JBQU8sRUFBRTtJQUNULGlCQUFRLENBQUMsK0JBQTZCLENBQUMsZUFBZSxDQUFDO0dBQzNDLDZCQUE2QixDQTBCekM7QUExQlksc0VBQTZCIn0=