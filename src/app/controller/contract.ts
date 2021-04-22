import {first, isEmpty, isString, isUndefined} from 'lodash';
import {controller, get, inject, post, provide, put} from 'midway';
import {
    ContractInfo,
    IContractService,
    IContractStateMachine,
    IMongoConditionBuilder,
    IPolicyService
} from '../../interface';
import {
    ApplicationError, ArgumentError, AuthorizationError, CommonRegex,
    FreelogContext, IdentityTypeEnum, visitorIdentityValidator,
    SubjectTypeEnum, ContractLicenseeIdentityTypeEnum, ContractStatusEnum, IJsonSchemaValidate
} from 'egg-freelog-base';
import {OutsideApiService} from '../service/outside-api-service';

@provide()
@controller('/v2/contracts')
export class ContractController {

    @inject()
    ctx: FreelogContext;
    @inject()
    policyService: IPolicyService;
    @inject()
    contractService: IContractService;
    @inject()
    batchSignSubjectValidator: IJsonSchemaValidate;
    @inject()
    mongoConditionBuilder: IMongoConditionBuilder;
    @inject()
    buildContractStateMachine: (contractInfo: ContractInfo) => IContractStateMachine;
    @inject()
    outsideApiService: OutsideApiService;

    @get('/test1')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async test() {
        await this.outsideApiService.getNodeInfo(80000000).then(this.ctx.success);
    }

    @get('/')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async index() {
        const {ctx} = this;

        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        const sort = ctx.checkQuery('sort').ignoreParamWhenEmpty().toSortObject().value;
        const licensorId = ctx.checkQuery('licensorId').optional().value; // 甲方
        const licenseeId = ctx.checkQuery('licenseeId').optional().value; // 乙方
        const identityType = ctx.checkQuery('identityType').exist().toInt().in([1, 2]).value; // 当前登录用户是作为甲方or乙方
        const subjectIds = ctx.checkQuery('subjectIds').optional().isSplitMongoObjectId().toSplitArray().default([]).value;
        const subjectType = ctx.checkQuery('subjectType').optional().toInt().in([SubjectTypeEnum.Presentable, SubjectTypeEnum.Resource, SubjectTypeEnum.UserGroup]).value;
        const isDefault = ctx.checkQuery('isDefault').optional().toInt().in([0, 1]).value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().toLowercase().value;
        const status = ctx.checkQuery('status').optional().toInt().in([ContractStatusEnum.Terminated, ContractStatusEnum.Executed, ContractStatusEnum.Exception]).value;
        const authStatus = ctx.checkQuery('authStatus').optional().toInt().value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1, 2]).default(0).value;
        const licenseeIdentityType = ctx.checkQuery('licenseeIdentityType').optional().toInt().in([ContractLicenseeIdentityTypeEnum.Resource, ContractLicenseeIdentityTypeEnum.Node, ContractLicenseeIdentityTypeEnum.ClientUser]).value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        const conditionBuilder = this.mongoConditionBuilder
            .setNumber('status', status)
            .setNumber('authStatus', authStatus)
            .setNumber('subjectType', subjectType)
            .setString('licensorId', licensorId, {isAllowEmptyString: false})
            .setString('licenseeId', licenseeId, {isAllowEmptyString: false})
            .setNumber('licenseeIdentityType', licenseeIdentityType)
            .setNumber('licensorOwnerId', ctx.userId, {isSetProperty: identityType === 1})
            .setNumber('licenseeOwnerId', ctx.userId, {isSetProperty: identityType === 2})
            .setArray('subjectId', subjectIds, {isAllowEmptyArray: false, operation: '$in'})
            .setNumber('sortId', isDefault ? 1 : 0, {isSetProperty: !isUndefined(isDefault)});

        if (isString(keywords) && keywords.length) {
            const searchRegExp = new RegExp(keywords, 'i');
            if (CommonRegex.mongoObjectId.test(keywords)) {
                conditionBuilder.setArray('$or', [{subjectId: keywords}, {_id: keywords}]);
            } else {
                conditionBuilder.setArray('$or', [{contractName: searchRegExp}, {licensorName: searchRegExp}, {licenseeName: searchRegExp}]);
            }
        }

        const pageResult = await this.contractService.findIntervalList(conditionBuilder.value(), skip, limit, projection, sort ?? {createDate: -1});
        if (isLoadPolicyInfo) {
            pageResult.dataList = await this.contractService.fillContractPolicyInfo(pageResult.dataList);
        }
        ctx.success(pageResult);
    }

    @get('/list')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser | IdentityTypeEnum.InternalClient)
    async list() {
        const {ctx} = this;

        const contractIds = ctx.checkQuery('contractIds').optional().isSplitMongoObjectId().toSplitArray().len(1, 300).value;
        const subjectIds = ctx.checkQuery('subjectIds').optional().isSplitMongoObjectId().toSplitArray().len(1, 300).value;
        const subjectType = ctx.checkQuery('subjectType').optional().toInt().in([SubjectTypeEnum.Presentable, SubjectTypeEnum.Resource, SubjectTypeEnum.UserGroup]).value;
        const licenseeIdentityType = ctx.checkQuery('licenseeIdentityType').optional().toInt().in([ContractLicenseeIdentityTypeEnum.Resource, ContractLicenseeIdentityTypeEnum.Node, ContractLicenseeIdentityTypeEnum.ClientUser]).value;
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
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async createContract() {
        const {ctx} = this;

        const subjectId = ctx.checkBody('subjectId').exist().isMongoObjectId().value;
        const subjectType = ctx.checkBody('subjectType').exist().in([SubjectTypeEnum.Presentable, SubjectTypeEnum.Resource, SubjectTypeEnum.UserGroup]).value;
        const policyId = ctx.checkBody('policyId').exist().isMd5().value;
        const licenseeId = ctx.checkBody('licenseeId').exist().value;
        const licenseeIdentityType = ctx.checkBody('licenseeIdentityType').exist().toInt().in([ContractLicenseeIdentityTypeEnum.Resource, ContractLicenseeIdentityTypeEnum.Node, ContractLicenseeIdentityTypeEnum.ClientUser]).value;
        ctx.validateParams();

        if (licenseeIdentityType === ContractLicenseeIdentityTypeEnum.ClientUser && licenseeId !== ctx.userId.toString()) {
            throw new ArgumentError(ctx.gettext('params-required-validate-failed', 'licenseeId'));
        }

        await this.contractService.batchSignSubjects([{
            subjectId, policyId
        }], licenseeId, licenseeIdentityType, subjectType).then(contracts => ctx.success(first(contracts)));
    }

    @post('/batchSign')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async batchCreateContracts() {
        const {ctx} = this;

        const licenseeId = ctx.checkBody('licenseeId').exist().value;
        const subjectType = ctx.checkBody('subjectType').exist().in([SubjectTypeEnum.Presentable, SubjectTypeEnum.Resource, SubjectTypeEnum.UserGroup]).value;
        const subjects = ctx.checkBody('subjects').exist().isArray().value;
        const licenseeIdentityType = ctx.checkBody('licenseeIdentityType').optional().toInt().in([ContractLicenseeIdentityTypeEnum.Resource, ContractLicenseeIdentityTypeEnum.Node, ContractLicenseeIdentityTypeEnum.ClientUser]).value;
        ctx.validateParams();

        const subjectValidateResult = this.batchSignSubjectValidator.validate(subjects);
        if (!isEmpty(subjectValidateResult.errors)) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'policies'), {
                errors: subjectValidateResult.errors
            });
        }

        if (licenseeIdentityType === ContractLicenseeIdentityTypeEnum.ClientUser && licenseeId !== ctx.userId.toString()) {
            throw new ArgumentError(ctx.gettext('params-required-validate-failed', 'licenseeId'));
        }

        await this.contractService.batchSignSubjects(subjects, licenseeId, licenseeIdentityType, subjectType).then(ctx.success);
    }

    @get('/count')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser | IdentityTypeEnum.InternalClient)
    async count() {
        const {ctx} = this;

        const userIds = ctx.checkQuery('userIds').exist().isSplitNumber().toSplitArray().len(1, 100).value;
        const licenseeIdentityType = ctx.checkQuery('licenseeIdentityType').optional().toInt().default(3).in([1, 2, 3]).value;
        ctx.validateParams();

        const list = await this.contractService.findLicenseeSignCounts(userIds.map(x => parseInt(x, 10)), licenseeIdentityType);
        ctx.success(userIds.map(userId => {
            const record = list.find(x => x.licensorOwnerId.toString() === userId);
            return {userId: parseInt(userId, 10), signedContractCount: record?.count ?? 0};
        }));
    }

    @get('/:contractId')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser | IdentityTypeEnum.InternalClient)
    async show() {
        const {ctx} = this;

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
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser | IdentityTypeEnum.InternalClient)
    async isCanExecEvent() {
        const {ctx} = this;

        const eventId = ctx.checkQuery('eventId').isMd5().exist().value;
        const contractId = ctx.checkParams('contractId').notEmpty().isContractId().value;
        ctx.validateParams();

        const contractInfo = await this.contractService.findById(contractId);
        ctx.entityNullObjectCheck(contractInfo);

        contractInfo.policyInfo = await this.policyService.findOne({policyId: contractInfo.policyId});
        const contractFsm = this.buildContractStateMachine(contractInfo);

        const isCanExecEvent = contractFsm.isCanExecEvent(eventId);

        ctx.success({contractInfo, eventId, isCanExec: isCanExecEvent});
    }

    @put('/:contractId/setDefault')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser | IdentityTypeEnum.InternalClient)
    async setDefault() {
        const {ctx} = this;

        const contractId = ctx.checkParams('contractId').notEmpty().isContractId().value;
        ctx.validateParams();

        const contractInfo = await this.contractService.findById(contractId);
        ctx.entityNullObjectCheck(contractInfo);

        if (contractInfo.licenseeId !== ctx.userId.toString()) {
            throw new AuthorizationError(ctx.gettext('user-authorization-failed'));
        }
        if (contractInfo.licenseeIdentityType !== ContractLicenseeIdentityTypeEnum.ClientUser) {
            throw new ApplicationError('current contract type not support');
        }

        await this.contractService.setDefaultExecContract(contractInfo);
    }
}
