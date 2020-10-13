import { BasePolicyCompiler } from './basePolicyCompiler';
import { IPolicyCompiler, PolicyInfo } from '../../interface';
import { SubjectType } from '../../enum';
export declare class PresentablePolicyCompiler extends BasePolicyCompiler implements IPolicyCompiler {
    compiler(subjectType: SubjectType, policyText: string): PolicyInfo;
}
