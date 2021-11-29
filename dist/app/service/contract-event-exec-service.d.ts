import { ContractInfo, IContractStateMachine } from '../../interface';
import { PolicyEventEnum } from '../../enum';
import { PolicyService } from './policy-service';
import { OutsideApiService } from './outside-api-service';
import { ContractEnvironmentVariableHandler } from '../../extend/contract-environment-variable-handler';
export declare class ContractEventExecService {
    ctx: any;
    mongoose: any;
    policyService: PolicyService;
    outsideApiService: OutsideApiService;
    buildContractStateMachine: (contractInfo: ContractInfo) => IContractStateMachine;
    contractEnvironmentVariableHandler: ContractEnvironmentVariableHandler;
    private eventCodeHandlerMap;
    constructor();
    /**
     * 初始化合约
     * @param contractInfo
     */
    initialContract(contractInfo: ContractInfo): Promise<boolean>;
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
    /**
     * 合约执行权限校验
     * @param contractInfo
     * @param eventType
     * @private
     */
    private contractExecutePermissionCheck;
}
