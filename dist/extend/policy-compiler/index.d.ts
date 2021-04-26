import { IPolicyCompiler, PolicyInfo } from '../../interface';
import { SubjectTypeEnum } from 'egg-freelog-base';
export declare class PolicyCompiler implements IPolicyCompiler {
    gatewayUrl: string;
    env: string;
    /**
     * 根据标的物类型编译策略文本
     * @param subjectType
     * @param policyText
     */
    compiler(subjectType: SubjectTypeEnum, policyText: string): Promise<PolicyInfo>;
    /**
     * 生成策略ID
     * @param subjectType
     * @param policyText
     */
    generatePolicyId(subjectType: SubjectTypeEnum, policyText: string): string;
}
