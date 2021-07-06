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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ContractEnvironmentVariableHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractEnvironmentVariableHandler = void 0;
const midway_1 = require("midway");
const lodash_1 = require("lodash");
const egg_freelog_base_1 = require("egg-freelog-base");
const enum_1 = require("../enum");
let ContractEnvironmentVariableHandler = ContractEnvironmentVariableHandler_1 = class ContractEnvironmentVariableHandler {
    constructor(app) {
        const ctx = app.createAnonymousContext();
        this.outsideApiService = ctx.requestContext.get('outsideApiService');
    }
    /**
     * 初始化全局环境变量
     */
    async initialStaticEnvironmentVariable(contractInfo) {
        if (![enum_1.ContractFsmRunningStatusEnum.Uninitialized, enum_1.ContractFsmRunningStatusEnum.InitializedError].includes(contractInfo.fsmRunningStatus)) {
            return;
        }
        const { symbolArgs } = contractInfo.policyInfo.fsmDeclarationInfo;
        if (!lodash_1.isArray(symbolArgs?.envArgs)) {
            return;
        }
        const staticEnvironmentVariables = lodash_1.intersection(ContractEnvironmentVariableHandler_1.StaticEnvironmentVariables, symbolArgs.envArgs);
        if (!staticEnvironmentVariables.length) {
            return;
        }
        contractInfo.fsmDeclarations.envArgs = contractInfo.fsmDeclarations.envArgs || [];
        for (const environmentVariable of staticEnvironmentVariables) {
            switch (environmentVariable?.toLowerCase()) {
                case 'self.account':
                    const accountInfo = await this.getIndividualTransactionAccounts(contractInfo.licensorOwnerId);
                    if (!accountInfo) {
                        throw new egg_freelog_base_1.ApplicationError('初始化环境变量失败,用户不存在交易账户');
                    }
                    const environmentVariableInfo = {
                        name: environmentVariable,
                        accountId: accountInfo.accountId,
                        ownerName: accountInfo.ownerName ?? ''
                    };
                    contractInfo.fsmDeclarations.envArgs.push(environmentVariableInfo);
                    break;
                default:
                    break;
            }
        }
    }
    /**
     * 获取个人交易账号
     * @param ownerId
     */
    async getIndividualTransactionAccounts(ownerId) {
        return this.outsideApiService.getIndividualTransactionAccounts(ownerId);
    }
    /**
     * 获取合约环境变量
     * @param contractInfo
     * @param name
     */
    async getEnvironmentVariable(contractInfo, name) {
        if (this.isIncludesStaticEnvironmentVariable(name)) {
            return contractInfo.fsmDeclarations.envArgs.find(x => x.name === name);
        }
        return null;
    }
    /**
     * 是否存在环境变量
     * @param name
     */
    isIncludesEnvironmentVariable(name) {
        return ['self.account'].includes(name);
    }
    /**
     * 是否包含静态环境变量(静态环境变量初始化之后就不在变更)
     * @param name
     */
    isIncludesStaticEnvironmentVariable(name) {
        return ContractEnvironmentVariableHandler_1.StaticEnvironmentVariables.includes(name);
    }
    /**
     * 获取全局环境变量
     */
    static get StaticEnvironmentVariables() {
        return ['self.account'];
    }
};
ContractEnvironmentVariableHandler = ContractEnvironmentVariableHandler_1 = __decorate([
    midway_1.provide(),
    midway_1.scope(midway_1.ScopeEnum.Singleton),
    __param(0, midway_1.plugin('app')),
    __metadata("design:paramtypes", [Object])
], ContractEnvironmentVariableHandler);
exports.ContractEnvironmentVariableHandler = ContractEnvironmentVariableHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZW52aXJvbm1lbnQtdmFyaWFibGUtaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leHRlbmQvY29udHJhY3QtZW52aXJvbm1lbnQtdmFyaWFibGUtaGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQXlEO0FBRXpELG1DQUE2QztBQUU3Qyx1REFBa0U7QUFDbEUsa0NBQXFEO0FBSXJELElBQWEsa0NBQWtDLDBDQUEvQyxNQUFhLGtDQUFrQztJQUkzQyxZQUEyQixHQUFHO1FBQzFCLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxzQkFBc0IsRUFBb0IsQ0FBQztRQUMzRCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsR0FBRyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsZ0NBQWdDLENBQUMsWUFBMEI7UUFDN0QsSUFBSSxDQUFDLENBQUMsbUNBQTRCLENBQUMsYUFBYSxFQUFFLG1DQUE0QixDQUFDLGdCQUFnQixDQUFDLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1lBQ3RJLE9BQU87U0FDVjtRQUNELE1BQU0sRUFBQyxVQUFVLEVBQUMsR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDO1FBQ2hFLElBQUksQ0FBQyxnQkFBTyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRTtZQUMvQixPQUFPO1NBQ1Y7UUFDRCxNQUFNLDBCQUEwQixHQUFHLHFCQUFZLENBQVMsb0NBQWtDLENBQUMsMEJBQTBCLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNJLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxNQUFNLEVBQUU7WUFDcEMsT0FBTztTQUNWO1FBQ0QsWUFBWSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDLGVBQWUsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQ2xGLEtBQUssTUFBTSxtQkFBbUIsSUFBSSwwQkFBMEIsRUFBRTtZQUMxRCxRQUFRLG1CQUFtQixFQUFFLFdBQVcsRUFBRSxFQUFFO2dCQUN4QyxLQUFLLGNBQWM7b0JBQ2YsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0NBQWdDLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDO29CQUM5RixJQUFJLENBQUMsV0FBVyxFQUFFO3dCQUNkLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO3FCQUNyRDtvQkFDRCxNQUFNLHVCQUF1QixHQUFHO3dCQUM1QixJQUFJLEVBQUUsbUJBQW1CO3dCQUN6QixTQUFTLEVBQUUsV0FBVyxDQUFDLFNBQVM7d0JBQ2hDLFNBQVMsRUFBRSxXQUFXLENBQUMsU0FBUyxJQUFJLEVBQUU7cUJBQ3pDLENBQUM7b0JBQ0YsWUFBWSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7b0JBQ25FLE1BQU07Z0JBQ1Y7b0JBQ0ksTUFBTTthQUNiO1NBQ0o7SUFDTCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLGdDQUFnQyxDQUFDLE9BQWU7UUFDbEQsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsZ0NBQWdDLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsc0JBQXNCLENBQUMsWUFBMEIsRUFBRSxJQUFZO1FBQ2pFLElBQUksSUFBSSxDQUFDLG1DQUFtQyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2hELE9BQU8sWUFBWSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQztTQUMxRTtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7O09BR0c7SUFDSCw2QkFBNkIsQ0FBQyxJQUFZO1FBQ3RDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVEOzs7T0FHRztJQUNILG1DQUFtQyxDQUFDLElBQVk7UUFDNUMsT0FBTyxvQ0FBa0MsQ0FBQywwQkFBMEIsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEYsQ0FBQztJQUVEOztPQUVHO0lBQ0gsTUFBTSxLQUFLLDBCQUEwQjtRQUNqQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDNUIsQ0FBQztDQUNKLENBQUE7QUF2Rlksa0NBQWtDO0lBRjlDLGdCQUFPLEVBQUU7SUFDVCxjQUFLLENBQUMsa0JBQVMsQ0FBQyxTQUFTLENBQUM7SUFLVixXQUFBLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTs7R0FKakIsa0NBQWtDLENBdUY5QztBQXZGWSxnRkFBa0MifQ==