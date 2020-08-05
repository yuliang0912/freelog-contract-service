import { PolicyInfo } from '../../interface';
export declare class ContractPolicyCompiler {
    /**
     * 编译策略文本
     * @param policyText
     * @param policyName
     * @returns {ContractPolicyInfo}
     */
    compilePolicyText(policyText: any): PolicyInfo;
}
