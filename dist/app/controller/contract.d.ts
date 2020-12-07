import { IContractService, IJsonSchemaValidate, IMongoConditionBuilder, IPolicyService } from '../../interface';
export declare class ContractController {
    contractFsmGenerator: any;
    policyService: IPolicyService;
    contractService: IContractService;
    batchSignSubjectValidator: IJsonSchemaValidate;
    mongoConditionBuilder: IMongoConditionBuilder;
    index(ctx: any): Promise<void>;
    list(ctx: any): Promise<void>;
    createContract(ctx: any): Promise<void>;
    batchCreateContracts(ctx: any): Promise<void>;
    count(ctx: any): Promise<void>;
    show(ctx: any): Promise<void>;
    isCanExecEvent(ctx: any): Promise<void>;
    setDefault(ctx: any): Promise<void>;
}
