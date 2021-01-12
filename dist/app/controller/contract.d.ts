import { IContractService, IMongoConditionBuilder, IPolicyService } from '../../interface';
import { FreelogContext, IJsonSchemaValidate } from 'egg-freelog-base';
import { ContractFsmGenerator } from '../../extend/contract-common-generator/contract-fsm-generator';
export declare class ContractController {
    ctx: FreelogContext;
    contractFsmGenerator: ContractFsmGenerator;
    policyService: IPolicyService;
    contractService: IContractService;
    batchSignSubjectValidator: IJsonSchemaValidate;
    mongoConditionBuilder: IMongoConditionBuilder;
    test(): Promise<void>;
    index(): Promise<void>;
    list(): Promise<void>;
    createContract(): Promise<void>;
    batchCreateContracts(): Promise<void>;
    count(): Promise<void>;
    show(): Promise<void>;
    isCanExecEvent(): Promise<void>;
    setDefault(): Promise<void>;
}
