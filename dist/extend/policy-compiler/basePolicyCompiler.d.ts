import { IPolicyCompiler, PolicyInfo } from '../../interface';
import { SubjectType } from '../../enum';
export declare class BasePolicyCompiler implements IPolicyCompiler {
    compiler(userId: number, subjectType: SubjectType, policyText: string, policyName: string): PolicyInfo;
    compilerErrorHandle(error: any): void;
    /**
     * 生成策略Id
     * @param policyText
     */
    generatePolicyId(userId: number, subjectType: SubjectType, policyText: string): any;
}
