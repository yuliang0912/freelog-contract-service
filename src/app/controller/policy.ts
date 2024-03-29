import {IMongoConditionBuilder, IPolicyService} from '../../interface';
import {controller, get, post, inject, provide} from 'midway';
import {FreelogContext, visitorIdentityValidator, IdentityTypeEnum, SubjectTypeEnum} from 'egg-freelog-base';
import {first} from 'lodash';

@provide()
@controller('/v2/policies')
export class PolicyController {

    @inject()
    ctx: FreelogContext;
    @inject()
    policyService: IPolicyService;
    @inject()
    mongoConditionBuilder: IMongoConditionBuilder;

    @get('/list')
    async list() {

        const {ctx} = this;
        const policyIds = ctx.checkQuery('policyIds').exist().isSplitMd5().toSplitArray().len(1, 200).value;
        const subjectType = ctx.checkQuery('subjectType').optional().toInt().in([SubjectTypeEnum.Presentable, SubjectTypeEnum.Resource, SubjectTypeEnum.UserGroup]).value;
        const isTranslate = ctx.checkQuery('isTranslate').optional().toBoolean().default(false).value;
        let projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        const condition = this.mongoConditionBuilder
            .setArray('policyId', policyIds)
            .setNumber('subjectType', subjectType).value();

        if (isTranslate) {
            projection = [];
        }
        const policies = await this.policyService.find(condition, projection.join(' '));
        if (!isTranslate) {
            return ctx.success(policies);
        }

        ctx.success(this.policyService.policyTranslate(policies));
    }

    @post('/')
    @visitorIdentityValidator(IdentityTypeEnum.InternalClient | IdentityTypeEnum.LoginUser)
    async batchCreate() {

        const {ctx} = this;
        const policyTexts = ctx.checkBody('policyTexts').exist().isArray().len(1, 100).value;
        const subjectType = ctx.checkBody('subjectType').exist().toInt().in([SubjectTypeEnum.UserGroup, SubjectTypeEnum.Resource, SubjectTypeEnum.Presentable]).value;
        ctx.validateParams();

        await this.policyService.findOrCreatePolicies(subjectType, policyTexts.map(decodeURIComponent)).then(ctx.success);
    }

    // @get('/convert')
    // async convert() {
    //     const policyList = await this.policyService.find({status: 0}) as any[];
    //     for (const policy of policyList) {
    //         const fsmDescriptionInfo = policy.fsmDescriptionInfo;
    //         for (const [_, stateInfo] of Object.entries(fsmDescriptionInfo)) {
    //             const transitions = [];
    //             for (const [toState, eventInfo] of Object.entries(stateInfo['transition'] || {})) {
    //                 if (!eventInfo) {
    //                     continue;
    //                 }
    //                 eventInfo['toState'] = toState;
    //                 transitions.push(eventInfo);
    //             }
    //             stateInfo['transitions'] = transitions;
    //             delete stateInfo['transition'];
    //         }
    //         await policy.updateOne({fsmDescriptionInfo});
    //     }
    //     this.ctx.success(1);
    // }

    @get('/:policyId')
    async show() {

        const {ctx} = this;
        const policyId = ctx.checkParams('policyId').exist().isMd5().value;
        let projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        const isTranslate = ctx.checkQuery('isTranslate').optional().toBoolean().default(false).value;
        ctx.validateParams();

        if (isTranslate) {
            projection = [];
        }
        const policyInfo = await this.policyService.findOne({policyId}, projection.join(' '));
        if (!isTranslate) {
            return ctx.success(policyInfo);
        }
        ctx.success(first(this.policyService.policyTranslate([policyInfo])));
    }
}
