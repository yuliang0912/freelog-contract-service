import { IPolicyService } from '../../interface';
export declare class PolicyController {
    policyService: IPolicyService;
    index(ctx: any): Promise<void>;
    list(ctx: any): Promise<void>;
    create(ctx: any): Promise<void>;
    update(ctx: any): Promise<void>;
    show(ctx: any): Promise<void>;
}
