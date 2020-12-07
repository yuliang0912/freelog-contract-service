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
let InitialErrorContractHandleJob = InitialErrorContractHandleJob_1 = class InitialErrorContractHandleJob {
    async exec(ctx) {
        const initialErrorContracts = await this.contractInfoProvider.find({
            status: enum_1.ContractStatusEnum.Executed,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdGlhbC1lcnJvci1jb250cmFjdC1oYW5kbGUtam9iLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NjaGVkdWxlL2luaXRpYWwtZXJyb3ItY29udHJhY3QtaGFuZGxlLWpvYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQStCO0FBRS9CLG1DQUFpRTtBQUNqRSxrQ0FBNEY7QUFJNUYsSUFBYSw2QkFBNkIscUNBQTFDLE1BQWEsNkJBQTZCO0lBT3RDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRztRQUNWLE1BQU0scUJBQXFCLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDO1lBQy9ELE1BQU0sRUFBRSx5QkFBa0IsQ0FBQyxRQUFRO1lBQ25DLGdCQUFnQixFQUFFLG1DQUE0QixDQUFDLGdCQUFnQjtTQUNsRSxFQUFFLElBQUksRUFBRSxFQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUMsVUFBVSxFQUFFLENBQUMsRUFBQyxFQUFDLENBQUMsQ0FBQztRQUU5QyxJQUFJLENBQUMsZ0JBQU8sQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFO1lBQ2pDLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyx3QkFBaUIsQ0FBQyx1QkFBdUIsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1NBQzVHO0lBQ0wsQ0FBQztJQUVELE1BQU0sS0FBSyxlQUFlO1FBQ3RCLE9BQU87WUFDSCxJQUFJLEVBQUUsZUFBZTtZQUNyQixJQUFJLEVBQUUsUUFBUTtZQUNkLFNBQVMsRUFBRSxJQUFJO1lBQ2YsT0FBTyxFQUFFLEtBQUs7U0FDakIsQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFBO0FBdkJHO0lBREMsZUFBTSxFQUFFOzsyRUFDWTtBQUVyQjtJQURDLGVBQU0sRUFBRTs7MkVBQ21DO0FBTG5DLDZCQUE2QjtJQUZ6QyxnQkFBTyxFQUFFO0lBQ1QsaUJBQVEsQ0FBQywrQkFBNkIsQ0FBQyxlQUFlLENBQUM7R0FDM0MsNkJBQTZCLENBMEJ6QztBQTFCWSxzRUFBNkIifQ==