import {ContractAuthStatusEnum, ContractFsmRunningStatusEnum, PolicyEventEnum} from '../enum';
import {
    ContractInfo, ContractTransitionRecord,
    FsmStateDescriptionInfo, IContractTriggerEventMessage
} from '../interface';
import {ContractLicenseeIdentityTypeEnum, IMongodbOperation} from 'egg-freelog-base';
import {inject, plugin, provide, scope, ScopeEnum} from 'midway';
import {ClientSession} from 'mongoose';
import {ContractEnvironmentVariableHandler} from '../extend/contract-environment-variable-handler';

@provide()
@scope(ScopeEnum.Singleton)
export class ContractFsmEventHandler {

    @plugin()
    mongoose;
    @inject()
    contractInfoProvider: IMongodbOperation<ContractInfo>;
    @inject()
    contractTransitionRecordProvider: IMongodbOperation<ContractTransitionRecord>;
    @inject()
    contractEnvironmentVariableHandler: ContractEnvironmentVariableHandler;

    /**
     * 同步订单状态,并且记录订单变更历史
     * 1.同步合同的授权状态
     * 2.同步状态机的运行状态描述
     * 3.同步状态机的实际执行状态
     * 4.记录状态机变更历史记录
     * @param contractInfo
     * @param session
     * @param eventInfo
     * @param transition
     * @param fromState
     * @param toState
     */
    async syncOrderStateAndChangedHistory(contractInfo: ContractInfo, session: ClientSession, eventInfo: IContractTriggerEventMessage, transition: string, fromState: string, toState: string): Promise<any> {

        const updateContractModel: Partial<ContractInfo> = {
            fsmCurrentState: toState,
            fsmRunningStatus: ContractFsmEventHandler.GetContractFsmRunningStatus(contractInfo, toState),
            authStatus: ContractFsmEventHandler.GetContractAuthStatus(contractInfo, toState),
            fsmDeclarations: contractInfo.fsmDeclarations
        };
        const transitionRecord: ContractTransitionRecord = {
            _id: this.mongoose.getNewObjectId(),
            contractId: contractInfo.contractId,
            fromState, toState, eventId: transition, eventInfo
        };

        const task1 = this.contractTransitionRecordProvider.create([transitionRecord], {session});
        const task2 = this.contractInfoProvider.updateOne({_id: contractInfo.contractId}, updateContractModel, {session});

        await Promise.all([task1, task2]).then(() => {
            console.log(`修改合约状态,contractId:${contractInfo.contractId},from:${fromState},to:${toState}`);
        });
        return transitionRecord._id;
    }

    /**
     * 合约初始化错误处理
     * @param contractInfo
     * @param session
     * @param eventInfo
     * @param errorMsg
     */
    async contractInitialErrorHandle(contractInfo: ContractInfo, session: ClientSession, eventInfo: IContractTriggerEventMessage, errorMsg: string) {
        console.log(`合约${contractInfo.contractId}初始化错误,${errorMsg}`);
        return this.contractInfoProvider.updateOne({
            _id: contractInfo.contractId,
            fsmRunningStatus: {$in: [ContractFsmRunningStatusEnum.Uninitialized, ContractFsmRunningStatusEnum.InitializedError]}
        }, {
            fsmRunningStatus: ContractFsmRunningStatusEnum.InitializedError
        }, {session});
    }

    /**
     * 执行初始化操作
     * @param contractInfo
     * @param session
     * @param eventInfo
     */
    async [`exec${PolicyEventEnum.InitialEvent}Handle`](contractInfo: ContractInfo, session: ClientSession, eventInfo: IContractTriggerEventMessage): Promise<void> {
        if (![ContractFsmRunningStatusEnum.InitializedError, ContractFsmRunningStatusEnum.Uninitialized].includes(contractInfo.fsmRunningStatus)) {
            return;
        }
        // 初始化静态全局环境变量
        await this.contractEnvironmentVariableHandler.initialStaticEnvironmentVariable(contractInfo);
    }

    /**
     * 获取合同的授权状态
     * @param contractInfo
     * @param toState
     * @constructor
     */
    static GetContractAuthStatus(contractInfo: ContractInfo, toState: string): number {
        const currentStateFsmDescriptionInfo = contractInfo.policyInfo.fsmDescriptionInfo[toState];
        if (currentStateFsmDescriptionInfo?.isAuth && currentStateFsmDescriptionInfo?.isTestAuth) {
            return ContractAuthStatusEnum.Authorized | ContractAuthStatusEnum.TestNodeAuthorized;
        } else if (currentStateFsmDescriptionInfo?.isAuth) {
            return ContractAuthStatusEnum.Authorized;
        } else if (currentStateFsmDescriptionInfo?.isTestAuth) {
            return ContractAuthStatusEnum.TestNodeAuthorized;
        } else {
            return ContractAuthStatusEnum.Unauthorized;
        }
    }

    /**
     * 获取合约的运行状态
     * @param contractInfo
     * @param toState
     * @constructor
     */
    static GetContractFsmRunningStatus(contractInfo: ContractInfo, toState: string): ContractFsmRunningStatusEnum {
        const fsmStateDescriptionInfo: FsmStateDescriptionInfo = contractInfo.policyInfo.fsmDescriptionInfo[toState];
        if (!fsmStateDescriptionInfo) { // 测试
            return ContractFsmRunningStatusEnum.Running;
        }
        // 如果获得授权,或者不是终止态,则属于运行状态
        if (fsmStateDescriptionInfo.isAuth || !fsmStateDescriptionInfo.isTerminate) {
            return ContractFsmRunningStatusEnum.Running;
        }
        // 如果已经终止,获得了测试授权,且不是C端消费者合约,则依然属于运行状态
        if (fsmStateDescriptionInfo.isTerminate && fsmStateDescriptionInfo.isTestAuth && contractInfo.licenseeIdentityType !== ContractLicenseeIdentityTypeEnum.ClientUser) {
            return ContractFsmRunningStatusEnum.Running;
        }
        return ContractFsmRunningStatusEnum.Terminated;
    }
}



