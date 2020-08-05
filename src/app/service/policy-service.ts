import {provide, inject} from 'midway';
// import {ArgumentError} from 'egg-freelog-base';
import {IPolicyCompiler, IPolicyService, PolicyInfo} from '../../interface';
import {SubjectType} from '../../enum';

@provide('policyService')
export class PolicyService implements IPolicyService {

    @inject()
    ctx;
    @inject()
    policyCompiler: IPolicyCompiler;
    @inject()
    policyInfoProvider;

    /**
     * 查找或者创建策略
     * @param {SubjectType} subjectType
     * @param {string} policyName
     * @param {string} policyText
     * @returns {Promise<ContractPolicyInfo>}
     */
    async findOrCreatePolicy(subjectType: SubjectType, policyName: string, policyText: string): Promise<PolicyInfo> {

        const userId = this.ctx.userId;
        const policyInfo = this.policyCompiler.compiler(userId, subjectType, policyText, policyName);

        const existingPolicy = await this.policyInfoProvider.findOne({policyId: policyInfo.policyId});
        if (existingPolicy) {
            return existingPolicy;
        }

        return this.policyInfoProvider.create({
            subjectType, userId,
            policyId: policyInfo.policyId,
            policyName: policyInfo.policyName,
            policyText: policyInfo.policyText,
            fsmDescriptionInfo: policyInfo.fsmDescriptionInfo
        });
    }

    async count(condition: object): Promise<number> {
        return this.policyInfoProvider.count(condition);
    }

    async findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy?: object): Promise<PolicyInfo[]> {
        return this.policyInfoProvider.findPageList(condition, page, pageSize, projection.join(' '), orderBy);
    }

    async findOne(condition: object, ...args): Promise<PolicyInfo> {
        return this.policyInfoProvider.findOne(condition, ...args);
    }

    async find(condition: object, ...args): Promise<PolicyInfo[]> {
        return this.policyInfoProvider.find(condition, ...args);
    }

    async findByIds(policyIds: string[], ...args): Promise<PolicyInfo[]> {
        return this.policyInfoProvider.find({policyId: {$in: policyIds}}, ...args);
    }

    async updatePolicy(policyInfo: PolicyInfo, policyName: string): Promise<boolean> {
        return this.policyInfoProvider.updateOne({
            policyId: policyInfo.policyId
        }, {policyName}).then(data => Boolean(data.ok));
    }
}
