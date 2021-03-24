import {ContractInfo, IContractTriggerEventMessage} from "../interface";
import {PolicyEventEnum} from "../enum";
import {provide, scope, ScopeEnum} from "midway";
import {ClientSession} from "mongoose";

@provide()
@scope(ScopeEnum.Singleton)
export class ContractFsmEventPretreatment {

    /**
     * 交易事件预处理
     * @param contractInfo
     * @param session
     * @param eventInfo
     */
    async [`onBefore${PolicyEventEnum.TransactionEvent}Handle`](contractInfo: ContractInfo, session: ClientSession, eventInfo: IContractTriggerEventMessage): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                //reject(new LogicError('交易校验失败'));
                resolve();
                console.log('交易前置校验')
            }, 1000);
        });
        // 创建合约交易单,校验账号与余额等操作都在此处进行
    }

}



