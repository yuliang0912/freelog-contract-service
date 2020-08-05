import {controller, get, inject, post, provide, put} from 'midway';
import {IContractService, IJsonSchemaValidate, IPolicyService} from '../../interface';
import {visitorIdentity} from '../../extend/vistorIdentityDecorator';
import {ArgumentError, AuthorizationError, ApplicationError, InternalClient, LoginUser} from 'egg-freelog-base';
import {ContractStatusEnum, IdentityType, IdentityTypeEnum, SubjectType} from '../../enum';
import {first, isEmpty, isString, isNumber, isUndefined} from 'lodash';
import {mongoObjectId} from 'egg-freelog-base/app/extend/helper/common_regex';

@provide()
@controller('/v2/contracts')
export class ContractController {

    @inject()
    contractFsmGenerator;
    @inject()
    policyService: IPolicyService;
    @inject()
    contractService: IContractService;
    @inject()
    batchSignSubjectValidator: IJsonSchemaValidate;

    @get('/')
    @visitorIdentity(LoginUser)
    async index(ctx) {
        const page = ctx.checkQuery('page').optional().default(1).toInt().gt(0).value;
        const pageSize = ctx.checkQuery('pageSize').optional().default(10).gt(0).lt(101).toInt().value;
        const licensorId = ctx.checkQuery('licensorId').optional().value; // 甲方
        const licenseeId = ctx.checkQuery('licenseeId').optional().value; // 乙方
        const identityType = ctx.checkQuery('identityType').exist().toInt().in([IdentityTypeEnum.Licensor, IdentityTypeEnum.Licensee]).value; // 当前登录用户是作为甲方or乙方
        const subjectIds = ctx.checkQuery('subjectIds').optional().isSplitMongoObjectId().toSplitArray().default([]).value;
        const subjectType = ctx.checkQuery('subjectType').optional().in([SubjectType.Presentable, SubjectType.Resource, SubjectType.UserGroup]).value;
        const isDefault = ctx.checkQuery('isDefault').optional().toInt().in([0, 1]).value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().toLowercase().value;
        const status = ctx.checkQuery('status').optional().in([ContractStatusEnum.Terminated, ContractStatusEnum.Executed, ContractStatusEnum.Exception]).value;
        const licenseeIdentityType = ctx.checkQuery('licenseeIdentityType').optional().toInt().in([IdentityType.Resource, IdentityType.Node, IdentityType.ClientUser]).value;
        const order = ctx.checkQuery('order').optional().in(['asc', 'desc']).default('desc').value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        const condition: any = {};
        if (identityType === IdentityTypeEnum.Licensor) {
            condition.licensorOwnerId = ctx.userId;
        }
        if (identityType === IdentityTypeEnum.Licensee) {
            condition.licenseeOwnerId = ctx.userId;
        }
        if (!isUndefined(licenseeIdentityType)) {
            condition.licenseeIdentityType = licenseeIdentityType;
        }
        if (isString(licensorId) && licensorId.length) {
            condition.licensorId = licensorId;
        }
        if (isString(licenseeId) && licenseeId.length) {
            condition.licenseeId = licenseeId;
        }
        if (!isEmpty(subjectIds)) {
            condition.subjectId = {$in: subjectIds};
        }
        if (!isUndefined(subjectType)) {
            condition.subjectType = subjectType;
        }
        if (!isUndefined(isDefault)) {
            condition.sortId = isDefault ? 1 : 0;
        }
        if (!isUndefined(status)) {
            condition.status = status;
        }
        if (isString(keywords) && keywords.length) {
            const searchRegExp = new RegExp(keywords, 'i');
            if (mongoObjectId.test(keywords)) {
                condition.$or = [{subjectId: keywords}, {_id: keywords}];
            } else {
                condition.$or = [{contractName: searchRegExp}, {licensorName: searchRegExp}, {licenseeName: searchRegExp}];
            }
        }
        let dataList = [];
        const totalItem = await this.contractService.count(condition);
        if (totalItem > (page - 1) * pageSize) {
            dataList = await this.contractService.findPageList(condition, page, pageSize, projection, {createDate: order === 'asc' ? 1 : -1});
        }
        ctx.success({page, pageSize, totalItem, dataList});
    }

    @get('/list')
    @visitorIdentity(LoginUser)
    async list(ctx) {
        const contractIds = ctx.checkQuery('contractIds').optional().isSplitMongoObjectId().toSplitArray().len(1, 300).value;
        const subjectIds = ctx.checkQuery('subjectIds').optional().isSplitMongoObjectId().toSplitArray().len(1, 300).value;
        const subjectType = ctx.checkQuery('subjectType').optional().in([SubjectType.Presentable, SubjectType.Resource, SubjectType.UserGroup]).value;
        const licenseeIdentityType = ctx.checkQuery('licenseeIdentityType').optional().toInt().in([IdentityType.Resource, IdentityType.Node, IdentityType.ClientUser]).value;
        const licensorId = ctx.checkQuery('licensorId').optional().value; // 甲方
        const licenseeId = ctx.checkQuery('licenseeId').optional().value; // 乙方
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        const condition: any = {};
        if ([contractIds, subjectIds].every(isUndefined)) {
            throw new ArgumentError(ctx.gettext('params-required-validate-failed', 'contractIds,subjectIds'));
        }
        if (!isEmpty(contractIds)) {
            condition._id = {$in: contractIds};
        }
        if (!isEmpty(subjectIds)) {
            condition.subjectId = {$in: subjectIds};
        }
        if (isString(licensorId) && licensorId.length) {
            condition.licensorId = licensorId;
        }
        if (isString(licenseeId) && licenseeId.length) {
            condition.licenseeId = licenseeId;
        }
        if (!isUndefined(licenseeIdentityType)) {
            condition.licenseeIdentityType = licenseeIdentityType;
        }
        if (!isUndefined(subjectType)) {
            condition.subjectType = subjectType;
        }

        await this.contractService.find(condition, projection.join(' ')).then(ctx.success);
    }

    /**
     * 查询历史合同
     * @param ctx
     * @returns {Promise<void>}
     */
    @get('/terminated')
    @visitorIdentity(LoginUser)
    async terminatedContracts(ctx) {
        const page = ctx.checkQuery('page').optional().default(1).toInt().gt(0).value;
        const pageSize = ctx.checkQuery('pageSize').optional().default(10).gt(0).lt(101).toInt().value;
        const subjectId = ctx.checkQuery('subjectId').exist().value;
        const subjectType = ctx.checkQuery('subjectType').optional().in([SubjectType.Presentable, SubjectType.Resource, SubjectType.UserGroup]).value;
        const identityType = ctx.checkQuery('identityType').exist().toInt().in([1, 2]).value; // 甲方or乙方
        const policyId = ctx.checkQuery('policyId').optional().exist().isMd5().value;
        const licenseeIdentityType = ctx.checkQuery('licenseeIdentityType').optional().toInt().in([IdentityType.Resource, IdentityType.Node, IdentityType.ClientUser]).value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        const identityField = identityType === 1 ? 'licensorId' : 'licenseeId';
        const condition: any = {
            subjectId, status: ContractStatusEnum.Terminated,
            [identityField]: ctx.request.userId.toString()
        };
        if (policyId) {
            condition.policyId = policyId;
        }
        if (isNumber(licenseeIdentityType)) {
            condition.licenseeIdentityType = licenseeIdentityType;
        }
        if (isNumber(subjectType)) {
            condition.subjectType = subjectType;
        }

        let dataList = [];
        const totalItem = await this.contractService.count(condition);
        if (totalItem > (page - 1) * pageSize) {
            dataList = await this.contractService.findPageList(condition, page, pageSize, projection, {createDate: -1});
        }
        ctx.success({page, pageSize, totalItem, dataList});
    }

    @post('/')
    @visitorIdentity(LoginUser)
    async createContract(ctx) {
        const subjectId = ctx.checkBody('subjectId').exist().isMongoObjectId().value;
        const subjectType = ctx.checkBody('subjectType').exist().in([SubjectType.Presentable, SubjectType.Resource, SubjectType.UserGroup]).value;
        const policyId = ctx.checkBody('policyId').exist().isMd5().value;
        const licenseeId = ctx.checkBody('licenseeId').exist().value;
        const licenseeIdentityType = ctx.checkBody('licenseeIdentityType').exist().toInt().in([IdentityType.Resource, IdentityType.Node, IdentityType.ClientUser]).value;
        ctx.validateParams();

        if (licenseeIdentityType === IdentityType.ClientUser && licenseeId !== ctx.userId.toString()) {
            throw new ArgumentError(ctx.gettext('params-required-validate-failed', 'licenseeId'));
        }

        await this.contractService.batchSignSubjects([{
            subjectId, policyId
        }], licenseeId, licenseeIdentityType, subjectType).then(contracts => ctx.success(first(contracts)));
    }

    @post('/batchSign')
    @visitorIdentity(LoginUser)
    async batchCreateContracts(ctx) {
        const licenseeId = ctx.checkBody('licenseeId').exist().value;
        const subjectType = ctx.checkBody('subjectType').exist().in([SubjectType.Presentable, SubjectType.Resource, SubjectType.UserGroup]).value;
        const subjects = ctx.checkBody('subjects').exist().isArray().value;
        const licenseeIdentityType = ctx.checkBody('licenseeIdentityType').optional().toInt().in([IdentityType.Resource, IdentityType.Node, IdentityType.ClientUser]).value;
        ctx.validateParams();

        const subjectValidateResult = this.batchSignSubjectValidator.validate(subjects);
        if (!isEmpty(subjectValidateResult.errors)) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'policies'), {
                errors: subjectValidateResult.errors
            });
        }

        if (licenseeIdentityType === IdentityType.ClientUser && licenseeId !== ctx.userId.toString()) {
            throw new ArgumentError(ctx.gettext('params-required-validate-failed', 'licenseeId'));
        }

        await this.contractService.batchSignSubjects(subjects, licenseeId, licenseeIdentityType, subjectType).then(ctx.success);
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
        if (contractInfo.licenseeIdentityType !== IdentityType.ClientUser) {
            throw new ApplicationError('current contract type not support');
        }

        await this.contractService.setDefaultExecContract(contractInfo);
    }
}
