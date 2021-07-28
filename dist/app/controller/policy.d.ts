import { IMongoConditionBuilder, IPolicyService } from '../../interface';
import { FreelogContext } from 'egg-freelog-base';
export declare class PolicyController {
    ctx: FreelogContext;
    policyService: IPolicyService;
    mongoConditionBuilder: IMongoConditionBuilder;
    list(): Promise<FreelogContext>;
    batchCreate(): Promise<void>;
    show(): Promise<void>;
}
