import { IPolicyService } from '../../interface';
export declare class PolicyController {
    policyService: IPolicyService;
    list(ctx: any): Promise<void>;
    batchCreate(ctx: any): Promise<void>;
    show(ctx: any): Promise<void>;
}
