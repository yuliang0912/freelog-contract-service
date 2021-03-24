import {ContractInfo, IContractTriggerEventMessage} from "../interface";
import {PolicyEventEnum} from "../enum";
import {provide, scope, ScopeEnum} from "midway";
import {ClientSession} from "mongoose";

@provide()
@scope(ScopeEnum.Singleton)
export class ContractFsmInvalidTransitionHandler {

    /**
     * 交易事件预处理
     * @param contractInfo
     * @param session
     * @param eventInfo
     */
    async [`onBefore${PolicyEventEnum.TransactionEvent}Handle`](contractInfo: ContractInfo, session: ClientSession, eventInfo: IContractTriggerEventMessage): Promise<void> {

    }
}



