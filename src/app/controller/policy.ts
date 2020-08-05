import {controller, get, post, put, inject, provide} from 'midway';
import {SubjectType} from '../../enum';
import {IPolicyService} from '../../interface';
import {LoginUser, InternalClient} from 'egg-freelog-base';
import {visitorIdentity} from '../../extend/vistorIdentityDecorator';
import {isNumber} from 'lodash';

@provide()
@controller('/v2/policies')
export class PolicyController {

    @inject()
    policyService: IPolicyService;

    @get('/')
    @visitorIdentity(LoginUser)
    async index(ctx) {
        const page = ctx.checkQuery('page').optional().default(1).toInt().gt(0).value;
        const pageSize = ctx.checkQuery('pageSize').optional().default(10).gt(0).lt(101).toInt().value;
        const subjectType = ctx.checkQuery('subjectType').optional().in([SubjectType.Presentable, SubjectType.Resource, SubjectType.UserGroup]).value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        let dataList = [];
        const condition: any = {userId: ctx.userId};
        if (isNumber(subjectType)) {
            condition.subjectType = subjectType;
        }
        const totalItem = await this.policyService.count(condition);
        if (totalItem > (page - 1) * pageSize) {
            dataList = await this.policyService.findPageList(condition, page, pageSize, projection, {createDate: -1});
        }
        ctx.success({page, pageSize, totalItem, dataList});
    }

    @get('/list')
    @visitorIdentity(LoginUser)
    async list(ctx) {

        const userId = ctx.checkQuery('userId').optional().toInt().value;
        const policyIds = ctx.checkQuery('policyIds').exist().isSplitMd5().toSplitArray().len(1, 200).value;
        const subjectType = ctx.checkQuery('subjectType').optional().toInt().in([SubjectType.Presentable, SubjectType.Resource, SubjectType.UserGroup]).value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        const condition: any = {policyId: {$in: policyIds}};
        if (isNumber(subjectType)) {
            condition.subjectType = subjectType;
        }
        if (isNumber(userId)) {
            condition.userId = userId;
        }

        await this.policyService.find(condition, projection.join(' ')).then(ctx.success);
    }

    @post('/')
    @visitorIdentity(InternalClient | LoginUser)
    async create(ctx) {

        const policyName = ctx.checkBody('policyName').exist().type('string').len(2, 20).value;
        const policyText = ctx.checkBody('policyText').exist().type('string').value;
        const subjectType = ctx.checkBody('subjectType').exist().toInt().in([SubjectType.UserGroup, SubjectType.Resource, SubjectType.Presentable]).value;
        ctx.validateParams();

        await this.policyService.findOrCreatePolicy(subjectType, policyName, policyText).then(ctx.success);
    }

    @put('/:policyId')
    @visitorIdentity(LoginUser)
    async update(ctx) {
        const policyId = ctx.checkParams('policyId').exist().isMd5().value;
        const policyName = ctx.checkBody('policyName').exist().type('string').len(2, 20).value;
        ctx.validateParams();

        const policyInfo = await this.policyService.findOne({policyId});
        ctx.entityNullValueAndUserAuthorizationCheck(policyInfo, {msg: ctx.gettext('params-validate-failed', 'policyId')});

        await this.policyService.updatePolicy(policyInfo, policyName).then(ctx.success);
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
