import { IPolicyCompiler, PolicyInfo, FsmDescriptionInfo } from '../../interface';
import { SubjectTypeEnum } from 'egg-freelog-base';
export declare class BasePolicyCompiler implements IPolicyCompiler {
    compiler(subjectType: SubjectTypeEnum, policyText: string): PolicyInfo;
    compilerErrorHandle(error: any): void;
    /**
     * 生成策略Id
     * @param policyText
     */
    generatePolicyId(subjectType: SubjectTypeEnum, policyText: string): string;
    /**
     * 生成事件ID
     * @param fsmDescriptionInfo
     */
    setFsmDescriptionInfoProperty(fsmDescriptionInfo: FsmDescriptionInfo): FsmDescriptionInfo;
}
