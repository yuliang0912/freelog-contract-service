import { BasePolicyCompiler } from './basePolicyCompiler';
import { IPolicyCompiler, PolicyInfo } from '../../interface';
import { SubjectType } from '../../enum';
export declare class ResourcePolicyCompiler extends BasePolicyCompiler implements IPolicyCompiler {
    compiler(userId: number, subjectType: SubjectType, policyText: string, policyName: string): PolicyInfo;
}
