import { IMongoConditionBuilder, IPolicyService } from '../../interface';
import { FreelogContext } from 'egg-freelog-base';
import { PolicyCompiler } from '../../extend/policy-compiler';
export declare class PolicyController {
    ctx: FreelogContext;
    policyService: IPolicyService;
    mongoConditionBuilder: IMongoConditionBuilder;
    policyCompiler: PolicyCompiler;
    list(): Promise<void>;
    batchCreate(): Promise<void>;
    show(): Promise<void>;
}
