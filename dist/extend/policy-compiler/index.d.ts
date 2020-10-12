import { SubjectType } from '../../enum';
import { IPolicyCompiler, PolicyInfo } from '../../interface';
export declare class PolicyCompiler implements IPolicyCompiler {
    readonly subjectPolicyCompilerMap: Map<SubjectType, IPolicyCompiler>;
    /**
     * 根据标的物类型编译策略文本
     * @param subjectType
     * @param policyText
     * @param policyName
     */
    compiler(subjectType: SubjectType, policyText: string): PolicyInfo;
    initialSubjectPolicyCompiler(): void;
}
