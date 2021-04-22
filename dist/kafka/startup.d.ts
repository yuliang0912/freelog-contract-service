import { KafkaClient } from './client';
import { ContractMqEventTriggerHandle } from '../contract-fsm-service/contract-mq-event-trigger-handle';
export declare class KafkaStartup {
    kafkaConfig: any;
    kafkaClient: KafkaClient;
    contractMqEventTriggerHandle: ContractMqEventTriggerHandle;
    /**
     * 启动,连接kafka-producer,订阅topic
     */
    startUp(): Promise<void>;
    /**
     * 订阅
     */
    subscribeTopics(): Promise<void>;
}
