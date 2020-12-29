import { BasePolicyCompiler } from './basePolicyCompiler';
import { IPolicyCompiler, PolicyInfo } from '../../interface';
import { SubjectTypeEnum } from 'egg-freelog-base';
export declare class ResourcePolicyCompiler extends BasePolicyCompiler implements IPolicyCompiler {
    compiler(subjectType: SubjectTypeEnum, policyText: string): PolicyInfo;
}
