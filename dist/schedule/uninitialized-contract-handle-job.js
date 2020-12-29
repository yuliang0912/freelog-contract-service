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
const midway_1 = require("midway");
const enum_1 = require("../enum");
const egg_freelog_base_1 = require("egg-freelog-base");
let UninitializedContractHandleJob = UninitializedContractHandleJob_1 = class UninitializedContractHandleJob {
    async exec(ctx) {
        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() - 3);
        const uninitializedContracts = await this.contractInfoProvider.find({
            status: egg_freelog_base_1.ContractStatusEnum.Executed,
            fsmRunningStatus: enum_1.ContractFsmRunningStatusEnum.Uninitialized,
            createDate: { $lt: expirationDate }
        }, null, { limit: 500, sort: { createDate: 1 } });
        if (!lodash_1.isEmpty(uninitializedContracts)) {
            await this.contractEventHandler.handle(enum_1.ContractEventEnum.InitialContractFsmEvent, uninitializedContracts);
        }
        return;
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
], UninitializedContractHandleJob.prototype, "contractInfoProvider", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], UninitializedContractHandleJob.prototype, "contractEventHandler", void 0);
UninitializedContractHandleJob = UninitializedContractHandleJob_1 = __decorate([
    midway_1.provide(),
    midway_1.schedule(UninitializedContractHandleJob_1.scheduleOptions)
], UninitializedContractHandleJob);
exports.UninitializedContractHandleJob = UninitializedContractHandleJob;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5pbml0aWFsaXplZC1jb250cmFjdC1oYW5kbGUtam9iLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NjaGVkdWxlL3VuaW5pdGlhbGl6ZWQtY29udHJhY3QtaGFuZGxlLWpvYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQStCO0FBRS9CLG1DQUFpRTtBQUNqRSxrQ0FBd0U7QUFDeEUsdURBQW9EO0FBSXBELElBQWEsOEJBQThCLHNDQUEzQyxNQUFhLDhCQUE4QjtJQU92QyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUc7UUFFVixNQUFNLGNBQWMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ2xDLGNBQWMsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRTNELE1BQU0sc0JBQXNCLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDO1lBQ2hFLE1BQU0sRUFBRSxxQ0FBa0IsQ0FBQyxRQUFRO1lBQ25DLGdCQUFnQixFQUFFLG1DQUE0QixDQUFDLGFBQWE7WUFDNUQsVUFBVSxFQUFFLEVBQUMsR0FBRyxFQUFFLGNBQWMsRUFBQztTQUNwQyxFQUFFLElBQUksRUFBRSxFQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUMsVUFBVSxFQUFFLENBQUMsRUFBQyxFQUFDLENBQUMsQ0FBQztRQUU5QyxJQUFJLENBQUMsZ0JBQU8sQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFO1lBQ2xDLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyx3QkFBaUIsQ0FBQyx1QkFBdUIsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1NBQzdHO1FBQ0QsT0FBTztJQUNYLENBQUM7SUFFRCxNQUFNLEtBQUssZUFBZTtRQUN0QixPQUFPO1lBQ0gsSUFBSSxFQUFFLGVBQWU7WUFDckIsSUFBSSxFQUFFLFFBQVE7WUFDZCxTQUFTLEVBQUUsSUFBSTtZQUNmLE9BQU8sRUFBRSxLQUFLO1NBQ2pCLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQTtBQTdCRztJQURDLGVBQU0sRUFBRTs7NEVBQ1k7QUFFckI7SUFEQyxlQUFNLEVBQUU7OzRFQUNtQztBQUxuQyw4QkFBOEI7SUFGMUMsZ0JBQU8sRUFBRTtJQUNULGlCQUFRLENBQUMsZ0NBQThCLENBQUMsZUFBZSxDQUFDO0dBQzVDLDhCQUE4QixDQWdDMUM7QUFoQ1ksd0VBQThCIn0=