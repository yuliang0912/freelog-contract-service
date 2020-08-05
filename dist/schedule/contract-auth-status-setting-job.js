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
var ContractAuthStatusSettingJob_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractAuthStatusSettingJob = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const enum_1 = require("../enum");
let ContractAuthStatusSettingJob = ContractAuthStatusSettingJob_1 = class ContractAuthStatusSettingJob {
    async exec(ctx) {
        const unknownAuthStatusContracts = await this.contractInfoProvider.find({
            status: enum_1.ContractStatusEnum.Executed,
            fsmRunningStatus: enum_1.ContractFsmRunningStatusEnum.Running,
            authStatus: enum_1.ContractAuthStatusEnum.Unknown
        }, null, { limit: 500, sort: { createDate: 1 } });
        if (!lodash_1.isEmpty(unknownAuthStatusContracts)) {
            console.log(`未知授权状态的合约数量:${unknownAuthStatusContracts.length}`);
            await this.contractEventHandler.handle(enum_1.ContractEventEnum.SetContractAuthStatusEvent, unknownAuthStatusContracts);
        }
    }
    static get scheduleOptions() {
        return {
            cron: '0 */3 * * * *',
            type: 'worker',
            immediate: false,
            disable: false
        };
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractAuthStatusSettingJob.prototype, "contractInfoProvider", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractAuthStatusSettingJob.prototype, "contractEventHandler", void 0);
ContractAuthStatusSettingJob = ContractAuthStatusSettingJob_1 = __decorate([
    midway_1.provide(),
    midway_1.schedule(ContractAuthStatusSettingJob_1.scheduleOptions)
], ContractAuthStatusSettingJob);
exports.ContractAuthStatusSettingJob = ContractAuthStatusSettingJob;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtYXV0aC1zdGF0dXMtc2V0dGluZy1qb2IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2NoZWR1bGUvY29udHJhY3QtYXV0aC1zdGF0dXMtc2V0dGluZy1qb2IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBLG1DQUErQjtBQUUvQixtQ0FBaUU7QUFDakUsa0NBQW9IO0FBSXBILElBQWEsNEJBQTRCLG9DQUF6QyxNQUFhLDRCQUE0QjtJQU9yQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUc7UUFFVixNQUFNLDBCQUEwQixHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQztZQUNwRSxNQUFNLEVBQUUseUJBQWtCLENBQUMsUUFBUTtZQUNuQyxnQkFBZ0IsRUFBRSxtQ0FBNEIsQ0FBQyxPQUFPO1lBQ3RELFVBQVUsRUFBRSw2QkFBc0IsQ0FBQyxPQUFPO1NBQzdDLEVBQUUsSUFBSSxFQUFFLEVBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBQyxVQUFVLEVBQUUsQ0FBQyxFQUFDLEVBQUMsQ0FBQyxDQUFDO1FBRTlDLElBQUksQ0FBQyxnQkFBTyxDQUFDLDBCQUEwQixDQUFDLEVBQUU7WUFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLDBCQUEwQixDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDaEUsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLHdCQUFpQixDQUFDLDBCQUEwQixFQUFFLDBCQUEwQixDQUFDLENBQUM7U0FDcEg7SUFDTCxDQUFDO0lBRUQsTUFBTSxLQUFLLGVBQWU7UUFDdEIsT0FBTztZQUNILElBQUksRUFBRSxlQUFlO1lBQ3JCLElBQUksRUFBRSxRQUFRO1lBQ2QsU0FBUyxFQUFFLEtBQUs7WUFDaEIsT0FBTyxFQUFFLEtBQUs7U0FDakIsQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFBO0FBMUJHO0lBREMsZUFBTSxFQUFFOzswRUFDWTtBQUVyQjtJQURDLGVBQU0sRUFBRTs7MEVBQ21DO0FBTG5DLDRCQUE0QjtJQUZ4QyxnQkFBTyxFQUFFO0lBQ1QsaUJBQVEsQ0FBQyw4QkFBNEIsQ0FBQyxlQUFlLENBQUM7R0FDMUMsNEJBQTRCLENBNkJ4QztBQTdCWSxvRUFBNEIifQ==