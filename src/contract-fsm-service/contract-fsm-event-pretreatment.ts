import {PolicyEventEnum} from '../enum';
import {ClientSession} from 'mongoose';
import {provide, scope, ScopeEnum, plugin, inject} from 'midway';
import {ContractInfo, IContractTriggerEventMessage} from '../interface';
import {BreakOffError, FreelogApplication, FreelogContext} from 'egg-freelog-base';
import ContractInvalidTransitionRecordProvider from '../app/data-provider/contract-invalid-transition-record-provider';

@provide()
@scope(ScopeEnum.Singleton)
export class ContractFsmEventPretreatment {

    @plugin()
    app: FreelogApplication;
    @inject()
    contractInvalidTransitionRecordProvider: ContractInvalidTransitionRecordProvider;

    /**
     * 交易事件预处理
     * @param contractInfo
     * @param session
     * @param eventInfo
     */
    async [`onBefore${PolicyEventEnum.TransactionEvent}Handle`](contractInfo: ContractInfo, session: ClientSession, eventInfo: IContractTriggerEventMessage): Promise<void> {

        const ctx = this.app.createAnonymousContext() as FreelogContext;
        const transactionRecordInfo = await ctx.curlIntranetApi(`${ctx.webApi.transactionInfoV2}/records/${eventInfo.args.transactionRecordId}`);
        // 合约在拨动状态之前.会对交易状态做二次确认.只有待确认状态的交易才是有效的.主要防止交易确认超时,导致支付中心把交易取消了.但是合约服务依然拨动了合约状态
        if (transactionRecordInfo.status !== 1) {
            const model = {
                contractId: contractInfo.contractId,
                contractState: contractInfo.fsmCurrentState,
                eventId: eventInfo?.eventId ?? '',
                eventCode: eventInfo?.code ?? '',
                eventInfo,
                triggerDate: eventInfo?.eventTime ?? new Date(),
                remark: '交易记录状态校验失败,交易已经被处理.'
            };
            await this.contractInvalidTransitionRecordProvider.create([model], {session});
            throw new BreakOffError('交易已被处理.不能重复');
        }
    }
}

