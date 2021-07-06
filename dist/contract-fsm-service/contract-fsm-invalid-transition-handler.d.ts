import { ClientSession } from 'mongoose';
import { KafkaClient } from '../kafka/client';
import { ContractInfo, IContractTriggerEventMessage } from '../interface';
import ContractInvalidTransitionRecordProvider from '../app/data-provider/contract-invalid-transition-record-provider';
export declare class ContractFsmInvalidTransitionHandler {
    kafkaClient: KafkaClient;
    contractInvalidTransitionRecordProvider: ContractInvalidTransitionRecordProvider;
    /**
     * 无效事件记录
     * @param contractInfo
     * @param session
     * @param eventInfo
     * @param remark
     */
    invalidTransitionHandle(contractInfo: ContractInfo, session: ClientSession, eventInfo: IContractTriggerEventMessage, remark?: string): Promise<void>;
}
