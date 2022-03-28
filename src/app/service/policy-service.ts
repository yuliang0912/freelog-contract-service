import {provide, inject} from 'midway';
import {IPolicyCompiler, IPolicyService, PolicyInfo} from '../../interface';
import {FreelogContext, IMongodbOperation, SubjectTypeEnum} from 'egg-freelog-base';

import {report} from '@freelog/resource-policy-lang';

@provide('policyService')
export class PolicyService implements IPolicyService {

    @inject()
    ctx: FreelogContext;
    @inject()
    policyCompiler: IPolicyCompiler;
    @inject()
    policyInfoProvider: IMongodbOperation<PolicyInfo>;

    policyTranslate(policies: PolicyInfo[]): PolicyInfo[] {
        const list = [];
        for (let policyInfo of policies) {
            policyInfo = Reflect.has(policyInfo, 'toObject') ? policyInfo['toObject']() : policyInfo;
            console.log(JSON.stringify({
                audiences: policyInfo.fsmDeclarationInfo?.audiences ?? [],
                declarations: policyInfo.fsmDeclarationInfo,
                description: policyInfo.fsmDeclarationInfo,
                states: policyInfo.fsmDescriptionInfo
            }));
            policyInfo.translateInfo = report({
                audiences: policyInfo.fsmDeclarationInfo?.audiences ?? [],
                declarations: policyInfo.fsmDeclarationInfo,
                description: policyInfo.fsmDeclarationInfo,
                states: policyInfo.fsmDescriptionInfo
            });
            list.push(policyInfo);
        }
        return list;
    }

    /**
     * 查找或者创建策略
     * @param subjectType
     * @param policyText
     */
    async findOrCreatePolicy(subjectType: SubjectTypeEnum, policyText: string): Promise<PolicyInfo> {

        const policyInfo = await this.policyCompiler.compiler(subjectType, policyText);
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
    async findOrCreatePolicies(subjectType: SubjectTypeEnum, policyTexts: string[]): Promise<PolicyInfo[]> {

        const policyList = await Promise.all(policyTexts.map(async policyText => this.policyCompiler.compiler(subjectType, policyText)));
        const policyIds = policyList.map(x => x.policyId);
        const existingPolicyMap = await this.find({policyId: {$in: policyIds}}).then(list => {
            return new Map(list.map(x => [x.policyId, x]));
        });
        const batchWriteObjects = policyList.filter(x => !existingPolicyMap.has(x.policyId));
        await this.policyInfoProvider.insertMany(batchWriteObjects);
        return policyList;
    }

    async count(condition: object): Promise<number> {
        return this.policyInfoProvider.count(condition);
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
