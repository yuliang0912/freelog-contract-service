import {ContractAuthStatusEnum, ContractFsmRunningStatusEnum, PolicyEventEnum} from '../enum';
import {
    ContractInfo,
    ContractTransitionRecord,
    FsmStateDescriptionInfo,
    IContractAuthStatusChangedEventMessage,
    IContractTriggerEventMessage
} from '../interface';
import {
    ContractLicenseeIdentityTypeEnum,
    ContractStatusEnum,
    IMongodbOperation,
    SubjectTypeEnum
} from 'egg-freelog-base';
import {inject, plugin, provide, scope, ScopeEnum} from 'midway';
import {ClientSession} from 'mongoose';
import {ContractEnvironmentVariableHandler} from '../extend/contract-environment-variable-handler';
import {ContractInfoSignatureProvider} from '../extend/contract-common-generator/contract-info-signature-generator';
import {KafkaClient} from '../kafka/client';

@provide()
@scope(ScopeEnum.Singleton)
export class ContractFsmEventHandler {

    @plugin()
    mongoose;
    @inject()
    kafkaClient: KafkaClient;
    @inject()
    contractInfoProvider: IMongodbOperation<ContractInfo>;
    @inject()
    contractTransitionRecordProvider: IMongodbOperation<ContractTransitionRecord>;
    @inject()
    contractEnvironmentVariableHandler: ContractEnvironmentVariableHandler;
    @inject()
    contractInfoSignatureProvider: ContractInfoSignatureProvider;

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
            fsmDeclarations: contractInfo.fsmDeclarations,
            fsmCurrentStateColors: contractInfo.policyInfo.fsmDescriptionInfo[toState]?.serviceStates ?? []
        };
        if (updateContractModel.fsmRunningStatus === ContractFsmRunningStatusEnum.Terminated) {
            updateContractModel.status = ContractStatusEnum.Terminated;
            updateContractModel.uniqueKey = this.contractInfoSignatureProvider.contractBaseInfoUniqueKeyGenerate({
                subjectId: contractInfo.subjectId, subjectType: contractInfo.subjectType,
                licenseeId: contractInfo.licenseeId, policyId: contractInfo.policyId,
                status: ContractStatusEnum.Terminated, contractId: contractInfo.contractId
            });
        }

        const transitionRecord: ContractTransitionRecord = {
            _id: this.mongoose.getNewObjectId(),
            contractId: contractInfo.contractId,
            fromState, toState, eventId: transition, eventInfo
        };

        const task1 = this.contractTransitionRecordProvider.create([transitionRecord], {session});
        const task2 = this.contractInfoProvider.updateOne({_id: contractInfo.contractId}, updateContractModel, {session});
        await Promise.all([task1, task2]).then(() => {
            // console.log(`修改合约状态,contractId:${contractInfo.contractId},from:${fromState},to:${toState}`);
            if (fromState === '_none_') {
                // 2秒之后再发送状态变更消息,给其他服务预留足够的数据处理时间. 因为初始化之后会发生合约状态变更. 也会产生对应的mq消息.
                setTimeout(() => this.execAuthStatusChangedEventHandle(contractInfo, updateContractModel.authStatus, updateContractModel.status, updateContractModel.fsmCurrentStateColors), 2000);
                return;
            }
            return this.execAuthStatusChangedEventHandle(contractInfo, updateContractModel.authStatus, updateContractModel.status, updateContractModel.fsmCurrentStateColors);
        });
        return transitionRecord._id;
    }

    /**
     * 合约初始化错误处理
     * @param contractInfo
     * @param eventInfo
     * @param errorMsg
     */
    async contractInitialErrorHandle(contractInfo: ContractInfo, eventInfo: IContractTriggerEventMessage, errorMsg: string) {
        console.error(`合约${contractInfo.contractId}初始化错误,${errorMsg}`);
        return this.contractInfoProvider.updateOne({
            _id: contractInfo.contractId,
            fsmRunningStatus: {$in: [ContractFsmRunningStatusEnum.Uninitialized, ContractFsmRunningStatusEnum.InitializedError]}
        }, {
            fsmRunningStatus: ContractFsmRunningStatusEnum.InitializedError
        });
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
     * 合约授权状态发生转变事件处理
     * @param contractInfo
     * @param afterAuthStatus
     * @param contractStatus
     * @param afterStateColors
     */
    async execAuthStatusChangedEventHandle(contractInfo: ContractInfo, afterAuthStatus: ContractAuthStatusEnum, contractStatus: ContractStatusEnum, afterStateColors: string[]) {
        if (contractInfo.authStatus === afterAuthStatus) {
            return;
        }

        const msgBody: IContractAuthStatusChangedEventMessage = {
            contractId: contractInfo.contractId,
            policyId: contractInfo.policyId,
            subjectId: contractInfo.subjectId,
            subjectName: contractInfo.subjectName,
            subjectType: contractInfo.subjectType,
            licenseeId: contractInfo.licenseeId,
            licenseeOwnerId: contractInfo.licenseeOwnerId,
            licensorId: contractInfo.licensorId,
            licensorOwnerId: contractInfo.licensorOwnerId,
            beforeAuthStatus: contractInfo.authStatus,
            licenseeIdentityType: contractInfo.licenseeIdentityType,
            afterStateColors, afterAuthStatus, contractStatus
        };

        let topicName = `${ContractLicenseeIdentityTypeEnum[contractInfo.licenseeIdentityType.toString()].toLowerCase()}-contract-auth-status-changed-topic`;
        if (contractInfo.subjectType === SubjectTypeEnum.UserGroup) {
            topicName = `user-group-contract-auth-status-changed-topic`;
        }
        return this.kafkaClient.send({
            topic: topicName,
            acks: -1,
            messages: [{
                key: contractInfo.contractId,
                value: JSON.stringify(msgBody),
                headers: {contractId: contractInfo.contractId}
            }]
        }).catch(error => {
            console.log('kafka消息发送失败', error);
        });
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
        if (contractInfo.fsmRunningStatus === ContractFsmRunningStatusEnum.ToBeRegisteredEvents) {
            return ContractFsmRunningStatusEnum.ToBeRegisteredEvents;
        }
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
        // 用户组合约如果终止态还存在对应的色块,则依然处于运行状态
        if (contractInfo.subjectType === SubjectTypeEnum.UserGroup && fsmStateDescriptionInfo.serviceStates?.length) {
            return ContractFsmRunningStatusEnum.Running;
        }
        return ContractFsmRunningStatusEnum.Terminated;
    }
}



