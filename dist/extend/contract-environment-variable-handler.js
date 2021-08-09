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
        const { symbolArgs } = contractInfo.policyInfo.fsmDeclarationInfo ?? {};
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
                    const accountInfo = await this.getIndividualTransactionAccounts(contractInfo.licensorOwnerId).catch(error => {
                        throw new egg_freelog_base_1.ApplicationError('初始化环境变量失败,用户不存在交易账户');
                    });
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
        console.log(contractInfo.fsmDeclarations.envArgs);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZW52aXJvbm1lbnQtdmFyaWFibGUtaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leHRlbmQvY29udHJhY3QtZW52aXJvbm1lbnQtdmFyaWFibGUtaGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQXlEO0FBRXpELG1DQUE2QztBQUU3Qyx1REFBa0U7QUFDbEUsa0NBQXFEO0FBSXJELElBQWEsa0NBQWtDLDBDQUEvQyxNQUFhLGtDQUFrQztJQUkzQyxZQUEyQixHQUFHO1FBQzFCLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxzQkFBc0IsRUFBb0IsQ0FBQztRQUMzRCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsR0FBRyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsZ0NBQWdDLENBQUMsWUFBMEI7UUFDN0QsSUFBSSxDQUFDLENBQUMsbUNBQTRCLENBQUMsYUFBYSxFQUFFLG1DQUE0QixDQUFDLGdCQUFnQixDQUFDLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1lBQ3RJLE9BQU87U0FDVjtRQUNELE1BQU0sRUFBQyxVQUFVLEVBQUMsR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDLGtCQUFrQixJQUFJLEVBQUUsQ0FBQztRQUN0RSxJQUFJLENBQUMsZ0JBQU8sQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLEVBQUU7WUFDL0IsT0FBTztTQUNWO1FBQ0QsTUFBTSwwQkFBMEIsR0FBRyxxQkFBWSxDQUFTLG9DQUFrQyxDQUFDLDBCQUEwQixFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzSSxJQUFJLENBQUMsMEJBQTBCLENBQUMsTUFBTSxFQUFFO1lBQ3BDLE9BQU87U0FDVjtRQUNELFlBQVksQ0FBQyxlQUFlLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQyxlQUFlLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUNsRixLQUFLLE1BQU0sbUJBQW1CLElBQUksMEJBQTBCLEVBQUU7WUFDMUQsUUFBUSxtQkFBbUIsRUFBRSxXQUFXLEVBQUUsRUFBRTtnQkFDeEMsS0FBSyxjQUFjO29CQUNmLE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLGdDQUFnQyxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7d0JBQ3hHLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO29CQUN0RCxDQUFDLENBQUMsQ0FBQztvQkFDSCxJQUFJLENBQUMsV0FBVyxFQUFFO3dCQUNkLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO3FCQUNyRDtvQkFDRCxNQUFNLHVCQUF1QixHQUFHO3dCQUM1QixJQUFJLEVBQUUsbUJBQW1CO3dCQUN6QixTQUFTLEVBQUUsV0FBVyxDQUFDLFNBQVM7d0JBQ2hDLFNBQVMsRUFBRSxXQUFXLENBQUMsU0FBUyxJQUFJLEVBQUU7cUJBQ3pDLENBQUM7b0JBQ0YsWUFBWSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7b0JBQ25FLE1BQU07Z0JBQ1Y7b0JBQ0ksTUFBTTthQUNiO1NBQ0o7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxPQUFlO1FBQ2xELE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLGdDQUFnQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzVFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLHNCQUFzQixDQUFDLFlBQTBCLEVBQUUsSUFBWTtRQUNqRSxJQUFJLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNoRCxPQUFPLFlBQVksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUM7U0FDMUU7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsNkJBQTZCLENBQUMsSUFBWTtRQUN0QyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxtQ0FBbUMsQ0FBQyxJQUFZO1FBQzVDLE9BQU8sb0NBQWtDLENBQUMsMEJBQTBCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hGLENBQUM7SUFFRDs7T0FFRztJQUNILE1BQU0sS0FBSywwQkFBMEI7UUFDakMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzVCLENBQUM7Q0FDSixDQUFBO0FBMUZZLGtDQUFrQztJQUY5QyxnQkFBTyxFQUFFO0lBQ1QsY0FBSyxDQUFDLGtCQUFTLENBQUMsU0FBUyxDQUFDO0lBS1YsV0FBQSxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7O0dBSmpCLGtDQUFrQyxDQTBGOUM7QUExRlksZ0ZBQWtDIn0=