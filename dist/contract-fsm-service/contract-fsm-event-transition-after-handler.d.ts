import { ContractInfo, PolicyEventInfo } from '../interface';
import { KafkaClient } from '../kafka/client';
import { IMongodbOperation } from 'egg-freelog-base';
import { ClientSession } from 'mongoose';
export declare class ContractFsmEventTransitionAfterHandler {
    kafkaClient: KafkaClient;
    contractInfoProvider: IMongodbOperation<ContractInfo>;
    /**
     * 注册合同新状态下需要侦听的事件(注册业务同时会取消注册之前的事件)
     * 分析当前状态下需要侦听的所有事件集,一次发送注册. 事件中心会先取消之前注册的事件集,然后重新注册新的事件集
     * 如果mq发送消息失败,并不影响本次合约的状态变更.而是修改合约状态,直到定时job把事件注册成功为止
     * 注册失败时,合约无法接受其他事件,直到合约注册成功为止
     * @param contractInfo
     * @param session
     * @param fromState
     * @param toState
     */
    registerContractEvents(contractInfo: ContractInfo, session: ClientSession, fromState: string, toState: string): Promise<void>;
    /**
     * 发送合约注册事件到消息队列
     * @param contractInfo
     * @param eventBody
     */
    sendContractRegisterEventToKafka(contractInfo: ContractInfo, eventBody: any): Promise<import("kafkajs").RecordMetadata[]>;
    /**
     * 获取可以注册的事件集
     * @param contractInfo
     * @param state
     */
    getCanRegisterEvents(contractInfo: ContractInfo, state: string): PolicyEventInfo[];
    /**
     * 错误处理,事件注册失败,可以通过后续的job重新尝试注册.注册成功之前,不允许合约执行其他事件
     * @param contractInfo
     * @param session
     */
    errorHandle(contractInfo: ContractInfo, session: ClientSession): Promise<{
        n: number;
        nModified: number;
        /**
         * 获取可以注册的事件集
         * @param contractInfo
         * @param state
         */
        ok: number;
    }>;
    /**
     * 允许注册的事件集
     * @constructor
     */
    static get AllowRegisterEvents(): string[];
}
