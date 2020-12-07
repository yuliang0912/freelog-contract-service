import { IPolicyCompiler, PolicyInfo, FsmDescriptionInfo } from '../../interface';
import { SubjectType } from '../../enum';
export declare class BasePolicyCompiler implements IPolicyCompiler {
    compiler(subjectType: SubjectType, policyText: string): PolicyInfo;
    compilerErrorHandle(error: any): void;
    /**
     * 生成策略Id
     * @param policyText
     */
    generatePolicyId(subjectType: SubjectType, policyText: string): any;
    /**
     * 生成事件ID
     * @param fsmDescriptionInfo
     */
    setFsmDescriptionInfoProperty(fsmDescriptionInfo: FsmDescriptionInfo): FsmDescriptionInfo;
}
