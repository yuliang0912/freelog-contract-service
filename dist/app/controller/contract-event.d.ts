import { IContractService, IPolicyService } from '../../interface';
import { FreelogContext } from 'egg-freelog-base';
export declare class ContractEventController {
    ctx: FreelogContext;
    policyService: IPolicyService;
    contractService: IContractService;
    execContractEvent(): Promise<void>;
}
