import {ContractAuthStatusEnum, ContractFsmRunningStatusEnum, PolicyEventEnum} from '../enum';
import {ContractInfo, FsmStateDescriptionInfo, IContractTriggerEventMessage} from "../interface";
import {ContractLicenseeIdentityTypeEnum, IMongodbOperation} from "egg-freelog-base";
import {inject, provide, scope, ScopeEnum} from 'midway';
import {KafkaClient} from '../kafka/client';
import {ClientSession} from "mongoose";

// 单例执行.所以ctx等需要通过参数传递
@provide()
@scope(ScopeEnum.Singleton)
export class ContractFsmEventHandler {

    allowRegisterEvents = ['A101', 'A102', 'A103'];
    @inject()
    kafkaClient: KafkaClient;
    @inject()
    contractInfoProvider: IMongodbOperation<ContractInfo>;
    @inject()
    contractChangedHistoryProvider: IMongodbOperation<any>;

    /**
     * 同步订单状态,并且记录订单变更历史
     * 1.同步合同的授权状态
     * 2.同步状态机的运行状态描述
     * 3.同步状态机的实际执行状态
     * 4.记录状态机变更历史记录
     * @param contractInfo
     * @param session
     * @param eventInfo
     * @param fromState
     * @param toState
     */
    async syncOrderStateAndChangedHistory(contractInfo: ContractInfo, session: ClientSession, eventInfo: IContractTriggerEventMessage, transition: string, fromState: string, toState: string): Promise<void> {
        const tasks = [];
        if (transition !== PolicyEventEnum.InitialEvent) {
            const eventRecordInfo = {
                fromState,
                toState,
                eventId: transition,
                triggerDate: eventInfo?.eventTime ?? new Date(),
                createDate: new Date()
            };
            tasks.push(this.contractChangedHistoryProvider.findOneAndUpdate({contractId: contractInfo.contractId}, {
                $addToSet: {histories: eventRecordInfo},
            }, {new: true, session}).then(changeHistory => {
                return changeHistory || this.contractChangedHistoryProvider.create({
                    contractId: contractInfo.contractId, histories: [eventRecordInfo]
                });
            }));
        }
        const updateContractModel: Partial<ContractInfo> = {
            fsmCurrentState: toState,
            fsmRunningStatus: ContractFsmEventHandler.GetContractFsmRunningStatus(contractInfo, toState),
            authStatus: ContractFsmEventHandler.GetContractAuthStatus(contractInfo, toState)
        };
        tasks.push(this.contractInfoProvider.updateOne({_id: contractInfo.contractId}, updateContractModel, {session}));
        await Promise.all(tasks).then(() => {
            console.log(`修改合约状态,from:${fromState},to:${toState}`);
        });
    }

    /**
     * 执行初始化操作
     * @param contractInfo
     * @param session
     * @param eventInfo
     */
    async [`exec${PolicyEventEnum.InitialEvent}Handler`](contractInfo: ContractInfo, session: ClientSession, eventInfo: IContractTriggerEventMessage,): Promise<void> {
        if (![ContractFsmRunningStatusEnum.InitializedError, ContractFsmRunningStatusEnum.Uninitialized].includes(contractInfo.fsmRunningStatus)) {
            return;
        }
        // 这里做合约初始化的操作, 如果合约有需要再实例化时做的事情,都在此处完成
        console.log('已初始化');
    }

    /**
     * 交易事件处理
     * @param contractInfo
     * @param session
     * @param eventInfo
     */
    async [`exec${PolicyEventEnum.TransactionEvent}Handler`](contractInfo: ContractInfo, session: ClientSession, eventInfo: IContractTriggerEventMessage,): Promise<void> {
        // 交易事件一般需要记录交易的详情订单数据.
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



