import {inject, plugin, provide, scope, ScopeEnum} from "midway";
import {ContractInfo, IContractStateMachine, IKafkaSubscribeMessageHandle, PolicyInfo} from "../interface";
import {EachBatchPayload} from "kafkajs";
import {IMongodbOperation} from "egg-freelog-base";
import {MongoClient} from "mongodb";

@provide()
@scope(ScopeEnum.Singleton)
export class ContractMqEventTriggerHandle implements IKafkaSubscribeMessageHandle {

    @plugin()
    mongoose: MongoClient;
    @inject()
    policyInfoProvider: IMongodbOperation<PolicyInfo>;
    @inject()
    contractInfoProvider: IMongodbOperation<ContractInfo>;
    @inject()
    buildContractStateMachine: (contractInfo: ContractInfo) => IContractStateMachine;

    consumerGroupId = 'freelog-contract-service#contract-event-handle-group';
    subscribeTopicName = 'contract-fsm-event-trigger-topic';

    constructor() {
        this.messageHandle = this.messageHandle.bind(this);
    }

    /**
     * mq消息处理
     * @param payload
     */
    async messageHandle(payload: EachBatchPayload): Promise<void> {
        const {batch, resolveOffset, heartbeat} = payload;
        const policyIds = [];
        const contractIds = batch.messages.map(x => x.key.toString());
        const contractMap = await this.contractInfoProvider.find({_id: {$in: contractIds}}).then(list => {
            list.forEach(x => policyIds.push(x.policyId));
            return new Map(list.map(x => [x.contractId, x]));
        });
        const policyMap = await this.policyInfoProvider.find({policyId: {$in: policyIds}}).then(list => {
            return new Map(list.map(x => [x.policyId, x]));
        });
        for (let message of batch.messages) {
            const eventInfo = JSON.parse(message.value.toString());
            const contractInfo = contractMap.get(eventInfo.contractId);
            if (!contractInfo) {
                resolveOffset(message.offset);
                continue;
            }
            contractInfo.policyInfo = policyMap.get(contractInfo.policyId);
            const contractFsm = this.buildContractStateMachine(contractInfo);
            if (!contractFsm.isCanExecEvent(eventInfo.eventId)) {
                resolveOffset(message.offset);
                continue;
            }
            const session = await this.mongoose.startSession();
            await session.withTransaction(async () => {
                return contractFsm.execContractEvent(session, eventInfo);
            }).then(() => {
                resolveOffset(message.offset)
            }).finally(() => {
                session.endSession();
            });
        }
        await heartbeat();
    }
}
