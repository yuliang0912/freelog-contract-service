import {inject, plugin, provide, scope, ScopeEnum} from 'midway';
import {ContractInfo, IContractStateMachine, IKafkaSubscribeMessageHandle, PolicyInfo} from '../interface';
import {EachMessagePayload} from 'kafkajs';
import {IMongodbOperation} from 'egg-freelog-base';
import {MongoClient} from 'mongodb';
import KafkaConsumeRecordProvider from '../app/data-provider/kafka-consume-record-provider';

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
    kafkaConsumeRecordProvider: KafkaConsumeRecordProvider;
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
    async messageHandle(payload: EachMessagePayload): Promise<void> {
        const {message} = payload;
        const eventInfo = JSON.parse(message.value.toString());

        const contractInfo = await this.contractInfoProvider.findOne({_id: eventInfo.contractId});
        if (!contractInfo) {
            console.error(`未找到合约信息,contractId:${eventInfo.contractId},offset:${message.offset}`);
            return;
        }
        contractInfo.policyInfo = await this.policyInfoProvider.findOne({policyId: contractInfo.policyId});
        eventInfo.offset = message.offset;
        const session = await this.mongoose.startSession();
        await session.withTransaction(async () => {
            return this.buildContractStateMachine(contractInfo).execContractEvent(session, eventInfo);
        }).finally(() => {
            session.endSession();
        });

        await this.kafkaConsumeRecordProvider.create({
            consumer: this.consumerGroupId,
            topic: payload.topic,
            partition: payload.partition,
            offset: message.offset,
            messageKey: message.key,
            messageTimestamp: message.timestamp,
            messageValue: JSON.parse(message.value.toString())
        }).catch(error => {
            console.log('kafka消费记录失败' + JSON.stringify({
                topic: payload.topic,
                partition: payload.partition,
                offset: message.offset
            }));
        });
    }
}
