import { ContractInfo, IContractStateMachine, IKafkaSubscribeMessageHandle, PolicyInfo } from '../interface';
import { EachMessagePayload } from 'kafkajs';
import { IMongodbOperation } from 'egg-freelog-base';
import { MongoClient } from 'mongodb';
import KafkaConsumeRecordProvider from '../app/data-provider/kafka-consume-record-provider';
export declare class ContractMqEventTriggerHandle implements IKafkaSubscribeMessageHandle {
    mongoose: MongoClient;
    policyInfoProvider: IMongodbOperation<PolicyInfo>;
    contractInfoProvider: IMongodbOperation<ContractInfo>;
    kafkaConsumeRecordProvider: KafkaConsumeRecordProvider;
    buildContractStateMachine: (contractInfo: ContractInfo) => IContractStateMachine;
    consumerGroupId: string;
    subscribeTopicName: string;
    constructor();
    /**
     * mq消息处理
     * @param payload
     */
    messageHandle(payload: EachMessagePayload): Promise<void>;
}
