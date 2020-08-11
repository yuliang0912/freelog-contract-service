import { IContractService, IJsonSchemaValidate, IPolicyService } from '../../interface';
export declare class ContractController {
    contractFsmGenerator: any;
    policyService: IPolicyService;
    contractService: IContractService;
    batchSignSubjectValidator: IJsonSchemaValidate;
    index(ctx: any): Promise<any>;
    list(ctx: any): Promise<void>;
    /**
     * 查询历史合同(可以通过index查询,传入status=ContractStatusEnum.Terminated实现)
     * @param ctx
     * @returns {Promise<void>}
     */
    createContract(ctx: any): Promise<void>;
    batchCreateContracts(ctx: any): Promise<void>;
    show(ctx: any): Promise<void>;
    isCanExecEvent(ctx: any): Promise<void>;
    setDefault(ctx: any): Promise<void>;
}
