import { IPolicyCompiler, IPolicyService, PageResult, PolicyInfo } from '../../interface';
import { SubjectType } from '../../enum';
export declare class PolicyService implements IPolicyService {
    ctx: any;
    policyCompiler: IPolicyCompiler;
    policyInfoProvider: any;
    /**
     * 查找或者创建策略
     * @param {SubjectType} subjectType
     * @param {string} policyName
     * @param {string} policyText
     * @returns {Promise<ContractPolicyInfo>}
     */
    findOrCreatePolicy(subjectType: SubjectType, policyName: string, policyText: string): Promise<PolicyInfo>;
    count(condition: object): Promise<number>;
    findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy?: object): Promise<PageResult>;
    findOne(condition: object, ...args: any[]): Promise<PolicyInfo>;
    find(condition: object, ...args: any[]): Promise<PolicyInfo[]>;
    findByIds(policyIds: string[], ...args: any[]): Promise<PolicyInfo[]>;
    updatePolicy(policyInfo: PolicyInfo, policyName: string): Promise<boolean>;
}
