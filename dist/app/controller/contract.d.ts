import { ContractInfo, IContractService, IContractStateMachine, IMongoConditionBuilder, IPolicyService } from '../../interface';
import { FreelogContext, IJsonSchemaValidate, IMongodbOperation } from 'egg-freelog-base';
import { OutsideApiService } from '../service/outside-api-service';
export declare class ContractController {
    ctx: FreelogContext;
    policyService: IPolicyService;
    contractService: IContractService;
    batchSignSubjectValidator: IJsonSchemaValidate;
    mongoConditionBuilder: IMongoConditionBuilder;
    buildContractStateMachine: (contractInfo: ContractInfo) => IContractStateMachine;
    outsideApiService: OutsideApiService;
    contractInfoProvider: IMongodbOperation<ContractInfo>;
    index(): Promise<void>;
    indexForAdmin(): Promise<void>;
    list(): Promise<void>;
    createContract(): Promise<void>;
    batchCreateContracts(): Promise<void>;
    count(): Promise<void>;
    subjectSignCount(): Promise<void>;
    /**
     * 甲方的所有标的物被签约的次数
     */
    licensorSignCount(): Promise<void>;
    subjectSignStatistics(): Promise<void>;
    show(): Promise<void>;
    isCanExecEvent(): Promise<void>;
    setDefault(): Promise<void>;
    deleteClientUserPresentableContract(): Promise<void>;
    /**
     * 合约流转记录
     */
    contractTransitionRecords(): Promise<void>;
}
