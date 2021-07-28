import {IMongoConditionBuilder, IPolicyService} from '../../interface';
import {controller, get, post, inject, provide} from 'midway';
import {FreelogContext, visitorIdentityValidator, IdentityTypeEnum, SubjectTypeEnum} from 'egg-freelog-base';
import {report} from '@freelog/resource-policy-lang/dist';
import {ContractEntity} from '@freelog/resource-policy-lang/dist/tools/ContractTool';
import {FSMEntity} from '@freelog/resource-policy-lang/src/translate/tools/FSMTool';
import {EventEntity} from '@freelog/resource-policy-lang/src/translate/tools/EventTool';

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
    @visitorIdentityValidator(IdentityTypeEnum.InternalClient | IdentityTypeEnum.LoginUser)
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

        const list = [];
        for (let policyInfo of policies) {
            policyInfo = policyInfo['toObject']();
            const contractEntity: ContractEntity = {
                audiences: policyInfo.fsmDeclarationInfo?.audiences ?? [],
                fsmStates: []
            };
            for (const [stateName, stateInfo] of Object.entries(policyInfo.fsmDescriptionInfo)) {
                const fsmState: FSMEntity = {
                    name: stateName,
                    serviceStates: stateInfo.serviceStates,
                    events: stateInfo.transitions.map(eventInfo => {
                        return {
                            id: eventInfo.eventId,
                            name: eventInfo.name,
                            args: eventInfo.args,
                            state: eventInfo.toState
                        } as EventEntity;
                    })
                };
                contractEntity.fsmStates.push(fsmState);
            }
            policyInfo.translateInfo = report(contractEntity);
            list.push(policyInfo);
        }

        ctx.success(list);
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
    @visitorIdentityValidator(IdentityTypeEnum.InternalClient | IdentityTypeEnum.LoginUser)
    async show() {

        const {ctx} = this;
        const policyId = ctx.checkParams('policyId').exist().isMd5().value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        await this.policyService.findOne({policyId}, projection.join(' ')).then(data => ctx.success(data['toObject']()));
    }

}
