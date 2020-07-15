import {controller, get, post, inject, provide} from 'midway';
import {SubjectType} from '../../enum';
import {IPolicyService} from '../../interface';
import {LoginUser, InternalClient} from 'egg-freelog-base';
import {visitorIdentity} from '../../extend/vistorIdentityDecorator';

@provide()
@controller('/v1/policies')
export class PolicyController {

    @inject()
    policyService: IPolicyService;

    @get('/list')
    @visitorIdentity(LoginUser)
    async list(ctx) {

        const contractIds = ctx.checkQuery('policyIds').optional().isSplitMongoObjectId().toSplitArray().len(1, 200).value;
        ctx.validateParams();

        ctx.success(contractIds);
    }

    @post('/')
    @visitorIdentity(InternalClient)
    async create(ctx) {

        const policyText = ctx.checkBody('policyText').exist().type('string').value;
        const subjectType = ctx.checkBody('subjectType').exist().toInt().in([SubjectType.UserGroup, SubjectType.Resource, SubjectType.Presentable]).value;
        ctx.validateParams();

        await this.policyService.findOrCreatePolicy(subjectType, policyText).then(ctx.success);
    }

    @get('/:policyId')
    @visitorIdentity(InternalClient)
    async show(ctx) {

        const policyId = ctx.checkParams('policyId').exist().isMd5().value;
        ctx.validateParams();

        await this.policyService.findOne({policyId}).then(ctx.success);
    }
}
