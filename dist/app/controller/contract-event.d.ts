import { IContractService } from '../../interface';
import { ContractEventExecService } from '../service/contract-event-exec-service';
import { FreelogContext } from 'egg-freelog-base';
export declare class ContractEventController {
    ctx: FreelogContext;
    contractService: IContractService;
    contractEventExecService: ContractEventExecService;
    /**
     * 支付事件
     */
    payment(): Promise<void>;
    /**
     * 初始化事件(人工主动初始化接口)
     */
    initial(): Promise<void>;
}
