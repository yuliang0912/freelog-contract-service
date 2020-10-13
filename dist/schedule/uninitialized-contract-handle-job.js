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
let UninitializedContractHandleJob = UninitializedContractHandleJob_1 = class UninitializedContractHandleJob {
    async exec(ctx) {
        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() - 3);
        const uninitializedContracts = await this.contractInfoProvider.find({
            status: enum_1.ContractStatusEnum.Executed,
            fsmRunningStatus: enum_1.ContractFsmRunningStatusEnum.Uninitialized,
            createDate: { $lt: expirationDate }
        }, null, { limit: 500, sort: { createDate: 1 } });
        if (!lodash_1.isEmpty(uninitializedContracts)) {
            await this.contractEventHandler.handle(enum_1.ContractEventEnum.InitialContractFsmEvent, uninitializedContracts);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5pbml0aWFsaXplZC1jb250cmFjdC1oYW5kbGUtam9iLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NjaGVkdWxlL3VuaW5pdGlhbGl6ZWQtY29udHJhY3QtaGFuZGxlLWpvYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQStCO0FBRS9CLG1DQUFpRTtBQUNqRSxrQ0FBNEY7QUFJNUYsSUFBYSw4QkFBOEIsc0NBQTNDLE1BQWEsOEJBQThCO0lBT3ZDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRztRQUNWLE1BQU0sY0FBYyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDbEMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFM0QsTUFBTSxzQkFBc0IsR0FBRyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUM7WUFDaEUsTUFBTSxFQUFFLHlCQUFrQixDQUFDLFFBQVE7WUFDbkMsZ0JBQWdCLEVBQUUsbUNBQTRCLENBQUMsYUFBYTtZQUM1RCxVQUFVLEVBQUUsRUFBQyxHQUFHLEVBQUUsY0FBYyxFQUFDO1NBQ3BDLEVBQUUsSUFBSSxFQUFFLEVBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBQyxVQUFVLEVBQUUsQ0FBQyxFQUFDLEVBQUMsQ0FBQyxDQUFDO1FBRTlDLElBQUksQ0FBQyxnQkFBTyxDQUFDLHNCQUFzQixDQUFDLEVBQUU7WUFDbEMsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLHdCQUFpQixDQUFDLHVCQUF1QixFQUFFLHNCQUFzQixDQUFDLENBQUM7U0FDN0c7SUFDTCxDQUFDO0lBRUQsTUFBTSxLQUFLLGVBQWU7UUFDdEIsT0FBTztZQUNILElBQUksRUFBRSxlQUFlO1lBQ3JCLElBQUksRUFBRSxRQUFRO1lBQ2QsU0FBUyxFQUFFLElBQUk7WUFDZixPQUFPLEVBQUUsS0FBSztTQUNqQixDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUE7QUEzQkc7SUFEQyxlQUFNLEVBQUU7OzRFQUNZO0FBRXJCO0lBREMsZUFBTSxFQUFFOzs0RUFDbUM7QUFMbkMsOEJBQThCO0lBRjFDLGdCQUFPLEVBQUU7SUFDVCxpQkFBUSxDQUFDLGdDQUE4QixDQUFDLGVBQWUsQ0FBQztHQUM1Qyw4QkFBOEIsQ0E4QjFDO0FBOUJZLHdFQUE4QiJ9