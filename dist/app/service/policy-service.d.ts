import { IPolicyCompiler, IPolicyService, PolicyInfo } from '../../interface';
import { FreelogContext, SubjectTypeEnum } from 'egg-freelog-base';
export declare class PolicyService implements IPolicyService {
    ctx: FreelogContext;
    policyCompiler: IPolicyCompiler;
    policyInfoProvider: any;
    /**
     * 查找或者创建策略
     * @param subjectType
     * @param policyText
     */
    findOrCreatePolicy(subjectType: SubjectTypeEnum, policyText: string): Promise<PolicyInfo>;
    /**
     * 创建策略(按顺序返回)
     * @param subjectType
     * @param policyTexts
     */
    findOrCreatePolicies(subjectType: SubjectTypeEnum, policyTexts: string[]): Promise<PolicyInfo[]>;
    count(condition: object): Promise<number>;
    findOne(condition: object, ...args: any[]): Promise<PolicyInfo>;
    find(condition: object, ...args: any[]): Promise<PolicyInfo[]>;
    findByIds(policyIds: string[], ...args: any[]): Promise<PolicyInfo[]>;
}
