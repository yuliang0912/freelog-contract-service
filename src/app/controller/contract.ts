import {controller, inject, get, put, post, provide} from 'midway';
import {IContractService, IJsonSchemaValidate, IPolicyService} from '../../interface';
import {visitorIdentity} from '../../extend/vistorIdentityDecorator';
import {LoginUser, InternalClient, ArgumentError, AuthorizationError} from 'egg-freelog-base';
import {ContractType, ContractStatusEnum, SubjectType} from '../../enum';
import {isEmpty} from 'lodash';

@provide()
@controller('/v1/contracts')
export class ContractController {

    @inject()
    contractFsmGenerator;
    @inject()
    policyService: IPolicyService;
    @inject()
    contractService: IContractService;
    @inject()
    batchSignSubjectValidator: IJsonSchemaValidate;

    @get('/list')
    @visitorIdentity(LoginUser)
    async list(ctx) {
        const contractIds = ctx.checkQuery('contractIds').exist().isSplitMongoObjectId().toSplitArray().len(1, 300).value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        await this.contractService.findByIds(contractIds, projection.join(' ')).then(ctx.success);
    }

    /**
     * 查询历史合同
     * @param ctx
     * @returns {Promise<void>}
     */
    @get('/list/terminated')
    @visitorIdentity(LoginUser)
    async terminatedContracts(ctx) {
        const subjectId = ctx.checkQuery('subjectId').exist().value;
        const subjectType = ctx.checkQuery('subjectId').exist().in([SubjectType.Presentable, SubjectType.Resource, SubjectType.UserGroup]).value;
        const identityType = ctx.checkQuery('identityType').exist().toInt().in([1, 2]).value; // 甲方or乙方
        const policyId = ctx.checkQuery('policyId').optional().exist().isMd5().value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        const identityField = identityType === 1 ? 'licensorId' : 'licenseeId';
        const condition: any = {
            subjectId, subjectType, status: ContractStatusEnum.Terminated,
            [identityField]: ctx.request.userId.toString()
        };
        if (policyId) {
            condition.policyId = policyId;
        }
        await this.contractService.find(condition, projection.join(' ')).then(ctx.success);
    }

    @post('/')
    @visitorIdentity(LoginUser)
    async createContract(ctx) {
        const subjectId = ctx.checkBody('subjectId').exist().isMongoObjectId().value;
        const subjectType = ctx.checkBody('subjectType').exist().in([SubjectType.Presentable, SubjectType.Resource, SubjectType.UserGroup]).value;
        const policyId = ctx.checkBody('policyId').exist().isMd5().value;
        let licenseeId = ctx.checkBody('licenseeId').optional().value;
        const contractType = ctx.checkBody('contractType').exist().toInt().in([ContractType.UserToNode, ContractType.NodeToResource, ContractType.ResourceToResource]).value;
        ctx.validateParams();

        if (contractType === ContractType.UserToNode) {
            licenseeId = ctx.request.userId;
        } else if (!licenseeId) {
            throw new ArgumentError(ctx.gettext('params-required-validate-failed', ':licenseeId'));
        }

        await this.contractService.signSubject({
            subjectId, subjectType, policyId
        }, licenseeId, contractType).then(ctx.success);
    }

    @post('/batchSign')
    @visitorIdentity(LoginUser)
    async batchCreateContracts(ctx) {
        let licenseeId = ctx.checkBody('licenseeId').optional().value;
        const subjectType = ctx.checkBody('subjectType').exist().in([SubjectType.Presentable, SubjectType.Resource, SubjectType.UserGroup]).value;
        const contractType = ctx.checkBody('contractType').exist().toInt().in([ContractType.UserToNode, ContractType.NodeToResource, ContractType.ResourceToResource]).value;
        const subjects = ctx.checkBody('subjects').exist().isArray().value;
        ctx.validateParams();

        const subjectValidateResult = this.batchSignSubjectValidator.validate(subjects);
        if (!isEmpty(subjectValidateResult.errors)) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'policies'), {
                errors: subjectValidateResult.errors
            });
        }

        if (contractType === ContractType.UserToNode) {
            licenseeId = ctx.request.userId;
        } else if (!licenseeId) {
            throw new ArgumentError(ctx.gettext('params-required-validate-failed', ':licenseeId'));
        }

        await this.contractService.batchSignSubjects(subjects, licenseeId, contractType, subjectType).then(ctx.success);
    }

    @get('/:contractId')
    @visitorIdentity(LoginUser | InternalClient)
    async show(ctx) {
        const contractId = ctx.checkParams('contractId').notEmpty().isContractId().value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        await this.contractService.findById(contractId, projection.join(' ')).then(ctx.success);
    }

    @get('/:contractId/isCanExecEvent')
    @visitorIdentity(LoginUser | InternalClient)
    async isCanExecEvent(ctx) {
        const eventId = ctx.checkQuery('eventId').isMd5().exist().value;
        const contractId = ctx.checkParams('contractId').notEmpty().isContractId().value;
        ctx.validateParams();

        const contractInfo = await this.contractService.findById(contractId);
        ctx.entityNullObjectCheck(contractInfo);

        const policyInfo = await this.policyService.findOne({policyId: contractInfo.policyId});
        const isCanExecEvent = this.contractFsmGenerator.isCanExecEvent(contractInfo, policyInfo, eventId);

        ctx.success({contractInfo, eventId, isCanExec: isCanExecEvent});
    }

    @put('/:contractId/setDefault')
    @visitorIdentity(LoginUser | InternalClient)
    async setDefault(ctx) {

        const contractId = ctx.checkParams('contractId').notEmpty().isContractId().value;
        ctx.validateParams();

        const contractInfo = await this.contractService.findById(contractId);
        ctx.entityNullObjectCheck(contractInfo);
        if (contractInfo.licenseeId !== ctx.request.userId.toString()) {
            throw new AuthorizationError(ctx.gettext('user-authorization-failed'));
        }

        await this.contractService.setDefaultExecContract(contractInfo);
    }
}
