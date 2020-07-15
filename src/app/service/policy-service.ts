import {provide, scope, inject} from 'midway';
// import {ArgumentError} from 'egg-freelog-base';
import {ContractPolicyInfo, IPolicyService} from '../../interface';
import {SubjectType} from '../../enum';

@scope('Singleton')
@provide('policyService')
export class PolicyService implements IPolicyService {

    @inject()
    contractPolicyCompiler;
    @inject()
    contractPolicyInfoProvider;

    /**
     * 查找或者创建策略
     * @param {SubjectType} subjectType
     * @param {string} policyText
     * @returns {Promise<ContractPolicyInfo>}
     */
    async findOrCreatePolicy(subjectType: SubjectType, policyText: string): Promise<ContractPolicyInfo> {

        const policyInfo = this.contractPolicyCompiler.compilePolicyText(policyText);

        const existingPolicy = await this.contractPolicyInfoProvider.findOne({policyId: policyInfo.policyId});
        if (existingPolicy) {
            return existingPolicy;
        }

        return this.contractPolicyInfoProvider.create({
            subjectType,
            policyId: policyInfo.policyId,
            policyText: policyInfo.policyText,
            fsmDescriptionInfo: policyInfo.fsmDescriptionInfo
        });
    }

    async findOne(condition: object, ...args): Promise<ContractPolicyInfo> {
        return this.contractPolicyInfoProvider.findOne(condition, ...args);
    }

    async find(condition: object, ...args): Promise<ContractPolicyInfo[]> {
        return this.contractPolicyInfoProvider.find(condition, ...args);
    }

    async findByIds(policyIds: string[], ...args): Promise<ContractPolicyInfo[]> {
        return this.contractPolicyInfoProvider.find({policyId: {$in: policyIds}}, ...args);
    }
}
