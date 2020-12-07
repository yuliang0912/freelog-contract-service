import {SubjectType} from '../../enum';
import {IMongoConditionBuilder, IPolicyService} from '../../interface';
import {LoginUser, InternalClient} from 'egg-freelog-base';
import {visitorIdentity} from '../../extend/vistorIdentityDecorator';
import {controller, get, post, inject, provide} from 'midway';

@provide()
@controller('/v2/policies')
export class PolicyController {

    @inject()
    policyService: IPolicyService;
    @inject()
    mongoConditionBuilder: IMongoConditionBuilder;

    @get('/list')
    @visitorIdentity(LoginUser)
    async list(ctx) {

        const policyIds = ctx.checkQuery('policyIds').exist().isSplitMd5().toSplitArray().len(1, 200).value;
        const subjectType = ctx.checkQuery('subjectType').optional().toInt().in([SubjectType.Presentable, SubjectType.Resource, SubjectType.UserGroup]).value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        const condition = this.mongoConditionBuilder
            .setArray('policyId', policyIds)
            .setNumber('subjectType', subjectType).value();

        await this.policyService.find(condition, projection.join(' ')).then(ctx.success);
    }

    // @post('/')
    // @visitorIdentity(InternalClient | LoginUser)
    // async create(ctx) {
    //
    //     const policyText = ctx.checkBody('policyText').exist().type('string').value;
    //     const subjectType = ctx.checkBody('subjectType').exist().toInt().in([SubjectType.UserGroup, SubjectType.Resource, SubjectType.Presentable]).value;
    //     ctx.validateParams();
    //
    //     await this.policyService.findOrCreatePolicy(subjectType, policyText).then(ctx.success);
    // }

    @post('/')
    @visitorIdentity(InternalClient | LoginUser)
    async batchCreate(ctx) {

        const policyTexts = ctx.checkBody('policyTexts').exist().isArray().len(1, 100).value;
        const subjectType = ctx.checkBody('subjectType').exist().toInt().in([SubjectType.UserGroup, SubjectType.Resource, SubjectType.Presentable]).value;
        ctx.validateParams();

        await this.policyService.findOrCreatePolicies(subjectType, policyTexts.map(decodeURIComponent)).then(ctx.success);
    }

    @get('/:policyId')
    @visitorIdentity(InternalClient | LoginUser)
    async show(ctx) {

        const policyId = ctx.checkParams('policyId').exist().isMd5().value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        await this.policyService.findOne({policyId}, projection.join(' ')).then(ctx.success);
    }
}
