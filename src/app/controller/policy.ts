import {IMongoConditionBuilder, IPolicyService} from '../../interface';
import {controller, get, post, inject, provide} from 'midway';
import {FreelogContext, visitorIdentityValidator, IdentityTypeEnum, SubjectTypeEnum} from 'egg-freelog-base';

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
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async list() {

        const {ctx} = this;
        const policyIds = ctx.checkQuery('policyIds').exist().isSplitMd5().toSplitArray().len(1, 200).value;
        const subjectType = ctx.checkQuery('subjectType').optional().toInt().in([SubjectTypeEnum.Presentable, SubjectTypeEnum.Resource, SubjectTypeEnum.UserGroup]).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        const condition = this.mongoConditionBuilder
            .setArray('policyId', policyIds)
            .setNumber('subjectType', subjectType).value();

        await this.policyService.find(condition, projection.join(' ')).then(ctx.success);
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

    @get('/:policyId')
    @visitorIdentityValidator(IdentityTypeEnum.InternalClient | IdentityTypeEnum.LoginUser)
    async show() {

        const {ctx} = this;
        const policyId = ctx.checkParams('policyId').exist().isMd5().value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        await this.policyService.findOne({policyId}, projection.join(' ')).then(ctx.success);
    }
}
