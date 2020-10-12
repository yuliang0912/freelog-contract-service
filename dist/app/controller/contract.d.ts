import { IContractService, IJsonSchemaValidate, IPolicyService } from '../../interface';
export declare class ContractController {
    contractFsmGenerator: any;
    policyService: IPolicyService;
    contractService: IContractService;
    batchSignSubjectValidator: IJsonSchemaValidate;
    index(ctx: any): Promise<void>;
    list(ctx: any): Promise<void>;
    createContract(ctx: any): Promise<void>;
    batchCreateContracts(ctx: any): Promise<void>;
    show(ctx: any): Promise<void>;
    isCanExecEvent(ctx: any): Promise<void>;
    setDefault(ctx: any): Promise<void>;
}
