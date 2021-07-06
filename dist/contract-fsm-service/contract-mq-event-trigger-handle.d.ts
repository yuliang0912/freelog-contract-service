import { ContractInfo, IContractStateMachine, IKafkaSubscribeMessageHandle, PolicyInfo } from '../interface';
import { EachMessagePayload } from 'kafkajs';
import { IMongodbOperation } from 'egg-freelog-base';
import { MongoClient } from 'mongodb';
export declare class ContractMqEventTriggerHandle implements IKafkaSubscribeMessageHandle {
    mongoose: MongoClient;
    policyInfoProvider: IMongodbOperation<PolicyInfo>;
    contractInfoProvider: IMongodbOperation<ContractInfo>;
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
