import {provide, inject} from 'midway';
// import {ArgumentError} from 'egg-freelog-base';
import {IPolicyCompiler, IPolicyService, PageResult, PolicyInfo} from '../../interface';
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
    async findOrCreatePolicy(subjectType: SubjectType, policyText: string): Promise<PolicyInfo> {

        const policyInfo = this.policyCompiler.compiler(subjectType, policyText);
        const existingPolicy = await this.policyInfoProvider.findOne({policyId: policyInfo.policyId});
        if (existingPolicy) {
            return existingPolicy;
        }

        return this.policyInfoProvider.create({
            subjectType,
            policyId: policyInfo.policyId,
            policyText: policyInfo.policyText,
            fsmDescriptionInfo: policyInfo.fsmDescriptionInfo
        });
    }

    /**
     * 创建策略(按顺序返回)
     * @param subjectType
     * @param policyTexts
     */
    async findOrCreatePolicies(subjectType: SubjectType, policyTexts: string[]): Promise<PolicyInfo[]> {

        const policyList = policyTexts.map(policyText => this.policyCompiler.compiler(subjectType, policyText));
        const policyIds = policyList.map(x => x.policyId);
        const existingPolicyMap = await this.find({policyId: {$in: policyIds}}).then(list => {
            return new Map(list.map(x => [x.policyId, x]));
        });
        const batchWriteObjects = [];
        for (const policyInfo of policyList) {
            if (existingPolicyMap.has(policyInfo.policyId)) {
                continue;
            }
            batchWriteObjects.push({
                subjectType,
                policyId: policyInfo.policyId,
                policyText: policyInfo.policyText,
                fsmDescriptionInfo: policyInfo.fsmDescriptionInfo
            });
        }
        await this.policyInfoProvider.insertMany(batchWriteObjects);
        return policyList;
    }

    async count(condition: object): Promise<number> {
        return this.policyInfoProvider.count(condition);
    }

    async findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy?: object): Promise<PageResult<PolicyInfo>> {
        let dataList = [];
        const totalItem = await this.count(condition);
        if (totalItem > (page - 1) * pageSize) {
            dataList = await this.policyInfoProvider.findPageList(condition, page, pageSize, projection.join(' '), orderBy);
        }
        return {page, pageSize, totalItem, dataList};
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
}
