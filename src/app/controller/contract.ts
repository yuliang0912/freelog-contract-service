import {first, isEmpty, isString, isUndefined} from 'lodash';
import {controller, get, inject, post, provide, put} from 'midway';
import {IContractService, IJsonSchemaValidate, IMongoConditionBuilder, IPolicyService} from '../../interface';
import {visitorIdentity} from '../../extend/vistorIdentityDecorator';
import {ApplicationError, ArgumentError, AuthorizationError, InternalClient, LoginUser} from 'egg-freelog-base';
import {ContractStatusEnum, IdentityType, IdentityTypeEnum, SubjectType} from '../../enum';
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
    @inject()
    mongoConditionBuilder: IMongoConditionBuilder;

    @get('/')
    @visitorIdentity(LoginUser)
    async index(ctx) {

        const page = ctx.checkQuery('page').optional().default(1).toInt().gt(0).value;
        const pageSize = ctx.checkQuery('pageSize').optional().default(10).gt(0).lt(101).toInt().value;
        const licensorId = ctx.checkQuery('licensorId').optional().value; // 甲方
        const licenseeId = ctx.checkQuery('licenseeId').optional().value; // 乙方
        const identityType = ctx.checkQuery('identityType').exist().toInt().in([IdentityTypeEnum.Licensor, IdentityTypeEnum.Licensee]).value; // 当前登录用户是作为甲方or乙方
        const subjectIds = ctx.checkQuery('subjectIds').optional().isSplitMongoObjectId().toSplitArray().default([]).value;
        const subjectType = ctx.checkQuery('subjectType').optional().toInt().in([SubjectType.Presentable, SubjectType.Resource, SubjectType.UserGroup]).value;
        const isDefault = ctx.checkQuery('isDefault').optional().toInt().in([0, 1]).value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().toLowercase().value;
        const status = ctx.checkQuery('status').optional().toInt().in([ContractStatusEnum.Terminated, ContractStatusEnum.Executed, ContractStatusEnum.Exception]).value;
        const authStatus = ctx.checkQuery('authStatus').optional().toInt().value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1, 2]).default(0).value;
        const licenseeIdentityType = ctx.checkQuery('licenseeIdentityType').optional().toInt().in([IdentityType.Resource, IdentityType.Node, IdentityType.ClientUser]).value;
        const order = ctx.checkQuery('order').optional().in(['asc', 'desc']).default('desc').value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        const conditionBuilder = this.mongoConditionBuilder
            .setNumber('status', status)
            .setNumber('authStatus', authStatus)
            .setNumber('subjectType', subjectType)
            .setString('licensorId', licensorId, {isAllowEmptyString: false})
            .setString('licenseeId', licenseeId, {isAllowEmptyString: false})
            .setNumber('licenseeIdentityType', licenseeIdentityType)
            .setNumber('licensorOwnerId', ctx.userId, {isSetProperty: identityType === IdentityTypeEnum.Licensor})
            .setNumber('licenseeOwnerId', ctx.userId, {isSetProperty: identityType === IdentityTypeEnum.Licensee})
            .setArray('subjectId', subjectIds, {isAllowEmptyArray: false, operation: '$in'})
            .setNumber('sortId', isDefault ? 1 : 0, {isSetProperty: !isUndefined(isDefault)});

        if (isString(keywords) && keywords.length) {
            const searchRegExp = new RegExp(keywords, 'i');
            if (mongoObjectId.test(keywords)) {
                conditionBuilder.setArray('$or', [{subjectId: keywords}, {_id: keywords}]);
            } else {
                conditionBuilder.setArray('$or', [{contractName: searchRegExp}, {licensorName: searchRegExp}, {licenseeName: searchRegExp}]);
            }
        }

        const pageResult = await this.contractService.findPageList(conditionBuilder.value(), page, pageSize, projection, {createDate: order === 'asc' ? 1 : -1});
        if (isLoadPolicyInfo) {
            pageResult.dataList = await this.contractService.fillContractPolicyInfo(pageResult.dataList);
        }
        ctx.success(pageResult);
    }

    @get('/list')
    @visitorIdentity(LoginUser)
    async list(ctx) {

        const contractIds = ctx.checkQuery('contractIds').optional().isSplitMongoObjectId().toSplitArray().len(1, 300).value;
        const subjectIds = ctx.checkQuery('subjectIds').optional().isSplitMongoObjectId().toSplitArray().len(1, 300).value;
        const subjectType = ctx.checkQuery('subjectType').optional().toInt().in([SubjectType.Presentable, SubjectType.Resource, SubjectType.UserGroup]).value;
        const licenseeIdentityType = ctx.checkQuery('licenseeIdentityType').optional().toInt().in([IdentityType.Resource, IdentityType.Node, IdentityType.ClientUser]).value;
        const licensorId = ctx.checkQuery('licensorId').optional().value; // 甲方
        const licenseeId = ctx.checkQuery('licenseeId').optional().value; // 乙方
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1, 2]).default(0).value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        if ([contractIds, subjectIds].every(isUndefined)) {
            throw new ArgumentError(ctx.gettext('params-required-validate-failed', 'contractIds,subjectIds'));
        }

        const condition = this.mongoConditionBuilder
            .setArray('_id', contractIds, {isAllowEmptyArray: false, operation: '$in'})
            .setArray('subjectId', subjectIds, {isAllowEmptyArray: false, operation: '$in'})
            .setString('licenseeId', licenseeId, {isAllowEmptyString: false})
            .setString('licensorId', licensorId, {isAllowEmptyString: false})
            .setNumber('licenseeIdentityType', licenseeIdentityType)
            .setNumber('subjectType', subjectType)
            .value();

        let dataList = await this.contractService.find(condition, projection.join(' '));
        if (isLoadPolicyInfo) {
            dataList = await this.contractService.fillContractPolicyInfo(dataList);
        }
        ctx.success(dataList);
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

    @get('/count')
    @visitorIdentity(LoginUser | InternalClient)
    async count(ctx) {

        const userIds = ctx.checkQuery('userIds').exist().isSplitNumber().toSplitArray().len(1, 100).value;
        const licenseeIdentityType = ctx.checkQuery('licenseeIdentityType').optional().toInt().default(3).in([1, 2, 3]).value;
        ctx.validateParams();

        const list = await this.contractService.findLicenseeSignCounts(userIds.map(x => parseInt(x, 10)), licenseeIdentityType);
        ctx.success(userIds.map(userId => {
            const record = list.find(x => x.licensorOwnerId.toString() === userId);
            return {userId: parseInt(userId, 10), createdNodeCount: record?.count ?? 0};
        }));
    }

    @get('/:contractId')
    @visitorIdentity(LoginUser | InternalClient)
    async show(ctx) {

        const contractId = ctx.checkParams('contractId').notEmpty().isContractId().value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1, 2]).default(0).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        let contractInfo = await this.contractService.findById(contractId, projection.join(' '));
        if (contractInfo && isLoadPolicyInfo) {
            contractInfo = await this.contractService.fillContractPolicyInfo([contractInfo]).then(first);
        }
        ctx.success(contractInfo);
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
