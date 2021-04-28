import {plugin, provide, scope, ScopeEnum} from 'midway';
import {ContractInfo} from '../interface';
import {intersection, isArray} from 'lodash';
import {OutsideApiService} from '../app/service/outside-api-service';
import {ApplicationError, FreelogContext} from 'egg-freelog-base';
import {ContractFsmRunningStatusEnum} from '../enum';

@provide()
@scope(ScopeEnum.Singleton)
export class ContractEnvironmentVariableHandler {

    outsideApiService: OutsideApiService;

    constructor(@plugin('app') app) {
        const ctx = app.createAnonymousContext() as FreelogContext;
        this.outsideApiService = ctx.requestContext.get('outsideApiService');
    }

    /**
     * 初始化全局环境变量
     */
    async initialStaticEnvironmentVariable(contractInfo: ContractInfo) {
        if (![ContractFsmRunningStatusEnum.Uninitialized, ContractFsmRunningStatusEnum.InitializedError].includes(contractInfo.fsmRunningStatus)) {
            return;
        }
        const {symbolArgs} = contractInfo.policyInfo.fsmDeclarationInfo;
        if (!isArray(symbolArgs?.envArgs)) {
            return;
        }
        const staticEnvironmentVariables = intersection<string>(ContractEnvironmentVariableHandler.StaticEnvironmentVariables, symbolArgs.envArgs);
        if (!staticEnvironmentVariables.length) {
            return;
        }
        contractInfo.fsmDeclarations.envArgs = contractInfo.fsmDeclarations.envArgs || [];
        for (const environmentVariable of staticEnvironmentVariables) {
            switch (environmentVariable) {
                case 'self.account':
                    const accountInfo = await this.getIndividualTransactionAccounts(contractInfo.licensorOwnerId);
                    if (!accountInfo) {
                        throw new ApplicationError('初始化环境变量失败,用户不存在交易账户');
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
    async getIndividualTransactionAccounts(ownerId: number) {
        return this.outsideApiService.getIndividualTransactionAccounts(ownerId);
    }

    /**
     * 获取全局环境变量
     */
    static get StaticEnvironmentVariables() {
        return ['self.account'];
    }
}
