import { ContractInfo, IContractStateMachine } from '../../interface';
import { PolicyEventEnum } from '../../enum';
import { PolicyService } from './policy-service';
import { OutsideApiService } from './outside-api-service';
export declare class ContractEventExecService {
    ctx: any;
    policyService: PolicyService;
    outsideApiService: OutsideApiService;
    buildContractStateMachine: (contractInfo: ContractInfo) => IContractStateMachine;
    private eventCodeHandlerMap;
    constructor();
    /**
     * 执行合约事件
     * @param contractInfo
     * @param eventType
     * @param eventId
     * @param args
     */
    execContractEvent(contractInfo: ContractInfo, eventType: PolicyEventEnum, eventId: string, ...args: any[]): Promise<any>;
    /**
     * 交易事件触发(发送交易请求到支付服务..后续的处理由支付何物和合约服务自动对接)
     * @param contractFsm
     * @param eventInfo
     * @param accountId
     * @param transactionAmount
     * @param password
     * @private
     */
    private transactionEventHandle;
}
