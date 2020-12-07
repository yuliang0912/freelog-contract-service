import { IContractService, IPolicyService } from '../../interface';
export declare class ContractEventController {
    policyService: IPolicyService;
    contractService: IContractService;
    execContractEvent(ctx: any): Promise<void>;
}
