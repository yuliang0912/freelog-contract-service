import {config, init, inject, provide, scope, ScopeEnum} from 'midway';
import {KafkaClient} from './client';

import {ContractMqEventTriggerHandle} from '../contract-fsm-service/contract-mq-event-trigger-handle';

@provide()
@scope(ScopeEnum.Singleton)
export class KafkaStartup {

    @config('kafka')
    kafkaConfig;
    @inject()
    kafkaClient: KafkaClient;
    @inject()
    contractMqEventTriggerHandle: ContractMqEventTriggerHandle;

    /**
     * 启动,连接kafka-producer,订阅topic
     */
    @init()
    async startUp() {
        if (this.kafkaConfig.enable !== true) {
            return;
        }
        await this.subscribeTopics().then(() => {
            console.log('kafka topic 订阅成功!');
        }).catch(error => {
            console.log('kafka topic 订阅失败!', error.toString());
        });
        await this.kafkaClient.producer.connect().catch(error => {
            console.log('kafka producer connect failed,', error);
        });
        // await this.kafkaClient.send({
        //     topic: 'resource-contract-auth-status-changed-queue',
        //     messages: [{
        //         value: JSON.stringify({
        //             contractId: '5f326eb01bcaeb00347b8eac',
        //             subjectId: '5f3245bbf5d0dd002f2f0610',
        //             subjectName: '12345676789/base1',
        //             subjectType: 1,
        //             licenseeId: '5f325f4034818a002f4a9b37',
        //             licenseeOwnerId: 50028,
        //             licensorId: '5f3245bbf5d0dd002f2f0610',
        //             licensorOwnerId: 50028,
        //             beforeAuthStatus: 1,
        //             afterAuthStatus: 128,
        //             contractStatus: 1
        //         })
        //     }],
        //     acks: -1
        // });
    }

    /**
     * 订阅
     */
    async subscribeTopics() {
        const topics = [this.contractMqEventTriggerHandle];
        return this.kafkaClient.subscribes(topics);
    }
}
