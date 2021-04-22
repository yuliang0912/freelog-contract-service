import {PolicyEventEnum} from '../enum';
import {ClientSession} from 'mongoose';
import {KafkaClient} from '../kafka/client';
import {inject, provide, scope, ScopeEnum} from 'midway';
import {ContractInfo, IContractTriggerEventMessage} from '../interface';
import ContractInvalidTransitionRecordProvider from '../app/data-provider/contract-invalid-transition-record-provider';

@provide()
@scope(ScopeEnum.Singleton)
export class ContractFsmInvalidTransitionHandler {

    @inject()
    kafkaClient: KafkaClient;
    @inject()
    contractInvalidTransitionRecordProvider: ContractInvalidTransitionRecordProvider;

    /**
     * 无效事件记录
     * @param contractInfo
     * @param session
     * @param eventInfo
     * @param remark
     */
    async invalidTransitionHandle(contractInfo: ContractInfo, session: ClientSession, eventInfo: IContractTriggerEventMessage, remark?: string) {
        const model = {
            contractId: contractInfo.contractId,
            contractState: contractInfo.fsmCurrentState,
            eventId: eventInfo?.eventId ?? '',
            eventCode: eventInfo?.code ?? '',
            triggerDate: eventInfo?.eventTime ?? new Date(),
            eventInfo, remark
        };
        await this.contractInvalidTransitionRecordProvider.create([model], {session});
    }

    /**
     * 交易事件状态无法流转处理(需要通知支付中心)
     * @param contractInfo
     * @param session
     * @param eventInfo
     */
    async [`exec${PolicyEventEnum.TransactionEvent}InvalidEventHandle`](contractInfo: ContractInfo, session: ClientSession, eventInfo: IContractTriggerEventMessage): Promise<boolean> {
        const messageBody = {transactionRecordId: eventInfo.args.transactionRecordId, transactionStatus: 3};
        await this.kafkaClient.send({
            topic: 'contract-payment-confirm-result--topic', acks: -1,
            messages: [{
                value: JSON.stringify(messageBody),
                headers: {signature: ''}
            }]
        });
        return true;
    }
}



