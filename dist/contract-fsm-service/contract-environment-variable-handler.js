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
            switch (environmentVariable) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZW52aXJvbm1lbnQtdmFyaWFibGUtaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cmFjdC1mc20tc2VydmljZS9jb250cmFjdC1lbnZpcm9ubWVudC12YXJpYWJsZS1oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBeUQ7QUFFekQsbUNBQTZDO0FBRTdDLHVEQUFrRTtBQUNsRSxrQ0FBcUQ7QUFJckQsSUFBYSxrQ0FBa0MsMENBQS9DLE1BQWEsa0NBQWtDO0lBSTNDLFlBQTJCLEdBQUc7UUFDMUIsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLHNCQUFzQixFQUFvQixDQUFDO1FBQzNELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxHQUFHLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxZQUEwQjtRQUM3RCxJQUFJLENBQUMsQ0FBQyxtQ0FBNEIsQ0FBQyxhQUFhLEVBQUUsbUNBQTRCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLEVBQUU7WUFDdEksT0FBTztTQUNWO1FBQ0QsTUFBTSxFQUFDLFVBQVUsRUFBQyxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUM7UUFDaEUsSUFBSSxDQUFDLGdCQUFPLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxFQUFFO1lBQy9CLE9BQU87U0FDVjtRQUNELE1BQU0sMEJBQTBCLEdBQUcscUJBQVksQ0FBUyxvQ0FBa0MsQ0FBQywwQkFBMEIsRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0ksSUFBSSxDQUFDLDBCQUEwQixDQUFDLE1BQU0sRUFBRTtZQUNwQyxPQUFPO1NBQ1Y7UUFDRCxZQUFZLENBQUMsZUFBZSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUMsZUFBZSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUM7UUFDbEYsS0FBSyxNQUFNLG1CQUFtQixJQUFJLDBCQUEwQixFQUFFO1lBQzFELFFBQVEsbUJBQW1CLEVBQUU7Z0JBQ3pCLEtBQUssY0FBYztvQkFDZixNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUM7b0JBQzlGLElBQUksQ0FBQyxXQUFXLEVBQUU7d0JBQ2QsTUFBTSxJQUFJLG1DQUFnQixDQUFDLHFCQUFxQixDQUFDLENBQUM7cUJBQ3JEO29CQUNELE1BQU0sdUJBQXVCLEdBQUc7d0JBQzVCLElBQUksRUFBRSxtQkFBbUI7d0JBQ3pCLFNBQVMsRUFBRSxXQUFXLENBQUMsU0FBUzt3QkFDaEMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxTQUFTLElBQUksRUFBRTtxQkFDekMsQ0FBQztvQkFDRixZQUFZLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztvQkFDbkUsTUFBTTtnQkFDVjtvQkFDSSxNQUFNO2FBQ2I7U0FDSjtJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsZ0NBQWdDLENBQUMsT0FBZTtRQUNsRCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxnQ0FBZ0MsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM1RSxDQUFDO0lBRUQ7O09BRUc7SUFDSCxNQUFNLEtBQUssMEJBQTBCO1FBQ2pDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUM1QixDQUFDO0NBQ0osQ0FBQTtBQTNEWSxrQ0FBa0M7SUFGOUMsZ0JBQU8sRUFBRTtJQUNULGNBQUssQ0FBQyxrQkFBUyxDQUFDLFNBQVMsQ0FBQztJQUtWLFdBQUEsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBOztHQUpqQixrQ0FBa0MsQ0EyRDlDO0FBM0RZLGdGQUFrQyJ9