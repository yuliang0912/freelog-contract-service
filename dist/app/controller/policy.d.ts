import { IMongoConditionBuilder, IPolicyService } from '../../interface';
import { FreelogContext } from 'egg-freelog-base';
export declare class PolicyController {
    ctx: FreelogContext;
    policyService: IPolicyService;
    mongoConditionBuilder: IMongoConditionBuilder;
    list(): Promise<void>;
    batchCreate(): Promise<void>;
    show(): Promise<void>;
}
