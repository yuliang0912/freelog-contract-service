import { IPolicyCompiler, PolicyInfo } from '../../interface';
import { SubjectTypeEnum } from 'egg-freelog-base';
export declare class PolicyCompiler implements IPolicyCompiler {
    readonly subjectPolicyCompilerMap: Map<SubjectTypeEnum, IPolicyCompiler>;
    /**
     * 根据标的物类型编译策略文本
     * @param subjectType
     * @param policyText
     * @param policyName
     */
    compiler(subjectType: SubjectTypeEnum, policyText: string): PolicyInfo;
    initialSubjectPolicyCompiler(): void;
}
