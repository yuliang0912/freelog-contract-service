import {first, isDate, isEmpty, isString, isUndefined} from 'lodash';
import {controller, del, get, inject, post, provide, put} from 'midway';
import {
    ContractInfo,
    IContractService,
    IContractStateMachine,
    IMongoConditionBuilder,
    IPolicyService
} from '../../interface';
import {
    ApplicationError,
    ArgumentError,
    AuthorizationError,
    CommonRegex,
    ContractLicenseeIdentityTypeEnum,
    ContractStatusEnum,
    FreelogContext,
    IdentityTypeEnum,
    IJsonSchemaValidate,
    IMongodbOperation,
    SubjectTypeEnum,
    visitorIdentityValidator
} from 'egg-freelog-base';
import {OutsideApiService} from '../service/outside-api-service';
import {deleteUndefinedFields} from 'egg-freelog-base/lib/freelog-common-func';
import {ContractAuthStatusEnum, ContractFsmRunningStatusEnum} from '../../enum';

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
    @inject()
    contractInfoProvider: IMongodbOperation<ContractInfo>;

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
        const isTranslate = ctx.checkQuery('isTranslate').optional().toBoolean().default(false).value;
        const licenseeIdentityType = ctx.checkQuery('licenseeIdentityType').optional().toInt().in([ContractLicenseeIdentityTypeEnum.Resource, ContractLicenseeIdentityTypeEnum.Node, ContractLicenseeIdentityTypeEnum.ClientUser]).value;
        const startDate = ctx.checkQuery('startDate').ignoreParamWhenEmpty().toDate().value;
        const endDate = ctx.checkQuery('endDate').ignoreParamWhenEmpty().toDate().value;
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
                conditionBuilder.setArray('$or', [{contractName: searchRegExp}, {subjectName: searchRegExp}, {licensorName: searchRegExp}, {licenseeName: searchRegExp}]);
            }
        }
        if (isDate(startDate) && isDate(endDate)) {
            conditionBuilder.setObject('createDate', {$gte: startDate, $lte: endDate});
        } else if (isDate(startDate)) {
            conditionBuilder.setObject('createDate', {$gte: startDate});
        } else if (isDate(endDate)) {
            conditionBuilder.setObject('createDate', {$lte: endDate});
        }
        const pageResult = await this.contractService.findIntervalList(conditionBuilder.value(), skip, limit, projection, sort ?? {createDate: -1});
        if (isLoadPolicyInfo) {
            pageResult.dataList = await this.contractService.fillContractPolicyInfo(pageResult.dataList, isTranslate);
        }
        ctx.success(pageResult);
    }

    @get('/search')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async indexForAdmin() {
        const {ctx} = this;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        const sort = ctx.checkQuery('sort').ignoreParamWhenEmpty().toSortObject().value;
        const licensorId = ctx.checkQuery('licensorId').optional().value; // 甲方
        const licenseeId = ctx.checkQuery('licenseeId').optional().value; // 乙方
        const subjectIds = ctx.checkQuery('subjectIds').optional().isSplitMongoObjectId().toSplitArray().default([]).value;
        const subjectType = ctx.checkQuery('subjectType').optional().toInt().in([SubjectTypeEnum.Presentable, SubjectTypeEnum.Resource, SubjectTypeEnum.UserGroup]).value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().toLowercase().trim().value;
        const keywordsType = ctx.checkQuery('keywordsType').optional().toInt().in([1, 2, 3, 4]).value; // 关键字类型(1:合约ID 2:标的物名称 3:甲方名称 4:乙方名称)
        const status = ctx.checkQuery('status').optional().toInt().in([ContractStatusEnum.Terminated, ContractStatusEnum.Executed, ContractStatusEnum.Exception]).value;
        const authStatus = ctx.checkQuery('authStatus').optional().toInt().value;
        const compositeState = ctx.checkQuery('compositeState').ignoreParamWhenEmpty().toInt().in([1, 2, 3, 4, 5, 6]).value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1, 2]).default(0).value;
        const isTranslate = ctx.checkQuery('isTranslate').optional().toBoolean().default(false).value;
        const licenseeIdentityType = ctx.checkQuery('licenseeIdentityType').optional().toInt().in([ContractLicenseeIdentityTypeEnum.Resource, ContractLicenseeIdentityTypeEnum.Node, ContractLicenseeIdentityTypeEnum.ClientUser]).value;
        const startDate = ctx.checkQuery('startDate').ignoreParamWhenEmpty().toDate().value;
        const endDate = ctx.checkQuery('endDate').ignoreParamWhenEmpty().toDate().value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        const conditionBuilder = this.mongoConditionBuilder
            .setNumber('status', status)
            .setNumber('authStatus', authStatus)
            .setNumber('subjectType', subjectType)
            .setString('licensorId', licensorId, {isAllowEmptyString: false})
            .setString('licenseeId', licenseeId, {isAllowEmptyString: false})
            .setNumber('licenseeIdentityType', licenseeIdentityType)
            .setArray('subjectId', subjectIds, {isAllowEmptyArray: false, operation: '$in'});

        if (isString(keywords) && keywords.length && keywordsType) {
            const searchRegExp = new RegExp(keywords, 'i');
            switch (keywordsType) {
                case 1:
                    conditionBuilder.setString('_id', keywords);
                    break;
                case  2:
                    conditionBuilder.setRegex('subjectName', searchRegExp);
                    break;
                case 3:
                    conditionBuilder.setRegex('licensorName', searchRegExp);
                    break;
                case 4:
                    conditionBuilder.setRegex('licenseeName', searchRegExp);
                    break;
                default:
                    break;
            }
        }
        if (compositeState) {
            switch (compositeState) {
                case 1: // 具备正式授权
                    conditionBuilder.setArray('authStatus', [1, 3], {operation: '$in'}).setNumber('status', ContractStatusEnum.Executed);
                    break;
                case 2: // 具备测试授权
                    conditionBuilder.setArray('authStatus', [2, 3], {operation: '$in'}).setNumber('status', ContractStatusEnum.Executed);
                    break;
                case 3: // 用户组标签
                    conditionBuilder.setNumber('authStatus', ContractAuthStatusEnum.Label).setNumber('status', ContractStatusEnum.Executed);
                    break;
                case 4: // 未授权
                    conditionBuilder.setNumber('authStatus', ContractAuthStatusEnum.Unauthorized).setNumber('status', ContractStatusEnum.Executed);
                    break;
                case 5: // 异常
                    conditionBuilder.setArray('$or', [{fsmRunningStatus: ContractFsmRunningStatusEnum.InitializedError}, {status: ContractStatusEnum.Exception}]);
                    break;
                case 6: // 终止
                    conditionBuilder.setNumber('status', ContractStatusEnum.Terminated);
                    break;
            }
        }
        if (isDate(startDate) && isDate(endDate)) {
            conditionBuilder.setObject('createDate', {$gte: startDate, $lte: endDate});
        } else if (isDate(startDate)) {
            conditionBuilder.setObject('createDate', {$gte: startDate});
        } else if (isDate(endDate)) {
            conditionBuilder.setObject('createDate', {$lte: endDate});
        }

        const pageResult = await this.contractService.findIntervalList(conditionBuilder.value(), skip, limit, projection, sort ?? {createDate: -1});
        if (isLoadPolicyInfo) {
            pageResult.dataList = await this.contractService.fillContractPolicyInfo(pageResult.dataList, isTranslate);
        }
        ctx.success(pageResult);
    }

    @get('/list')
    // @visitorIdentityValidator(IdentityTypeEnum.LoginUser | IdentityTypeEnum.InternalClient)
    async list() {
        const {ctx} = this;

        const contractIds = ctx.checkQuery('contractIds').optional().isSplitMongoObjectId().toSplitArray().len(1, 300).value;
        const subjectIds = ctx.checkQuery('subjectIds').optional().isSplitMongoObjectId().toSplitArray().len(1, 300).value;
        const subjectType = ctx.checkQuery('subjectType').optional().toInt().in([SubjectTypeEnum.Presentable, SubjectTypeEnum.Resource, SubjectTypeEnum.UserGroup]).value;
        const licenseeIdentityType = ctx.checkQuery('licenseeIdentityType').optional().toInt().in([ContractLicenseeIdentityTypeEnum.Resource, ContractLicenseeIdentityTypeEnum.Node, ContractLicenseeIdentityTypeEnum.ClientUser]).value;
        const licensorId = ctx.checkQuery('licensorId').optional().value; // 甲方
        const licenseeId = ctx.checkQuery('licenseeId').optional().value; // 乙方
        const authStatusList = ctx.checkQuery('authStatusList').optional().isSplitNumber().toSplitArray().len(1, 10).value; // 授权状态
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1, 2]).default(0).value;
        const isTranslate = ctx.checkQuery('isTranslate').optional().toBoolean().default(false).value;
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
            .setArray('authStatus', authStatusList, {isAllowEmptyArray: false, operation: '$in'})
            .value();

        let dataList = await this.contractService.find(condition, projection.join(' '));
        if (isLoadPolicyInfo) {
            dataList = await this.contractService.fillContractPolicyInfo(dataList, isTranslate);
        }
        ctx.success(dataList);
    }

    @post('/')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async createContract() {
        const {ctx} = this;

        const subjectId = ctx.checkBody('subjectId').exist().isMongoObjectId().value;
        const policyId = ctx.checkBody('policyId').exist().isMd5().value;
        const licenseeId = ctx.checkBody('licenseeId').exist().value;
        // 先限制前端必须传,但是不使用
        ctx.checkBody('subjectType').exist().in([SubjectTypeEnum.Presentable]).value;
        ctx.checkBody('licenseeIdentityType').exist().toInt().in([ContractLicenseeIdentityTypeEnum.ClientUser]).value;
        ctx.validateParams();

        if (licenseeId.toString() !== ctx.userId.toString()) {
            throw new ArgumentError(ctx.gettext('params-validate-failed', 'licenseeId'));
        }

        await this.contractService.signClientUserPresentable(subjectId, policyId, licenseeId).then(contracts => ctx.success(first(contracts)));
    }

    @post('/batchSign')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async batchCreateContracts() {
        const {ctx} = this;

        const licenseeId = ctx.checkBody('licenseeId').exist().value;
        const subjectType = ctx.checkBody('subjectType').exist().in([SubjectTypeEnum.Presentable, SubjectTypeEnum.Resource, SubjectTypeEnum.UserGroup]).value;
        const subjects = ctx.checkBody('subjects').exist().isArray().value;
        const isWaitInitial = ctx.checkBody('isWaitInitial').optional().toBoolean().default(false).value;
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

        await this.contractService.batchSignSubjects(subjects, licenseeId, licenseeIdentityType, subjectType, isWaitInitial).then(ctx.success);
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

    // 签约统计(通用)
    @get('/signCount')
    async signStatistics() {
        const {ctx} = this;
        const objectIds = ctx.checkQuery('objectIds').exist().toSplitArray().len(0, 100).value;
        // 1: 甲方ID 2:甲方所属ID 3:乙方ID 4:乙方所属ID 5:标的物ID
        const objectType = ctx.checkQuery('objectType').exist().toInt().in([1, 2, 3, 4, 5]).value;
        const subjectType = ctx.checkQuery('subjectType').exist().toInt().in([SubjectTypeEnum.Presentable, SubjectTypeEnum.Resource, SubjectTypeEnum.UserGroup]).value;
        const startDate = ctx.checkQuery('startDate').ignoreParamWhenEmpty().toDate().value;
        const endDate = ctx.checkQuery('endDate').ignoreParamWhenEmpty().toDate().value;
        ctx.validateParams();

        const objectTypeInfo = {
            1: 'licensorId', 2: 'licensorOwnerId', 3: 'licenseeId', 4: 'licenseeOwnerId', 5: 'subjectId'
        };
        const objectTypeName = objectTypeInfo[objectType];
        const conditionBuilder = this.mongoConditionBuilder
            .setNumber('subjectType', subjectType)
            .setArray(objectTypeName, objectIds, {isAllowEmptyArray: false, operation: '$in'});

        if (isDate(startDate) && isDate(endDate)) {
            conditionBuilder.setObject('createDate', {$gte: startDate, $lte: endDate});
        } else if (isDate(startDate)) {
            conditionBuilder.setObject('createDate', {$gte: startDate});
        } else if (isDate(endDate)) {
            conditionBuilder.setObject('createDate', {$lte: endDate});
        }
        const condition = conditionBuilder.value();
        const countMap: Map<string, number> = await this.contractService.commonSignCounts(condition, objectTypeName).then(list => {
            return new Map(list.map(x => [x.key, x.count]));
        });
        ctx.success(objectIds.map(item => {
            return {
                key: item,
                field: objectTypeName,
                count: countMap.get(item) ?? 0
            };
        }));
    }

    @get('/subjects/signCount')
    async subjectSignCount() {

        const {ctx} = this;
        const subjectIds = ctx.checkQuery('subjectIds').exist().toSplitArray().len(1, 300).value;
        const subjectType = ctx.checkQuery('subjectType').optional().toInt().in([SubjectTypeEnum.Presentable, SubjectTypeEnum.Resource, SubjectTypeEnum.UserGroup]).value;
        ctx.validateParams();

        const condition = deleteUndefinedFields({subjectId: {$in: subjectIds}, subjectType});
        const subjectSignCountMap = await this.contractService.findSubjectSignCounts(condition).then(list => {
            return new Map<string, number>(list.map(x => [x.subjectId, x.count]));
        });

        ctx.success(subjectIds.map(subjectId => {
            return {
                subjectId,
                count: subjectSignCountMap.has(subjectId) ? subjectSignCountMap.get(subjectId) : 0
            };
        }));
    }

    // 甲方的所有标的物被签约的次数
    @get('/licensors/signCount')
    async licensorSignCount() {

        const {ctx} = this;
        const licensorIds = ctx.checkQuery('licensorIds').exist().toSplitArray().len(1, 300).value;
        const subjectType = ctx.checkQuery('subjectType').optional().toInt().in([SubjectTypeEnum.Presentable, SubjectTypeEnum.Resource, SubjectTypeEnum.UserGroup]).value;
        ctx.validateParams();

        const condition = deleteUndefinedFields({licensorId: {$in: licensorIds}, subjectType});
        const subjectSignCountMap = await this.contractService.findLicensorSignCounts(condition).then(list => {
            return new Map<string, number>(list.map(x => [x.licensorId, x.count]));
        });

        ctx.success(licensorIds.map(licensorId => {
            return {
                licensorId,
                count: subjectSignCountMap.get(licensorId) ?? 0
            };
        }));
    }

    // 标的物签约统计
    @get('/subjects/presentables/signStatistics')
    async subjectSignStatistics() {
        const {ctx} = this;
        const nodeId = ctx.checkQuery('nodeId').optional().toInt().value;
        const signUserIdentityType = ctx.checkQuery('signUserIdentityType').exist().toInt().in([1, 2]).value;
        const keywords = ctx.checkQuery('keywords').optional().type('string').value;
        ctx.validateParams();

        const condition = deleteUndefinedFields<Partial<ContractInfo>>({
            subjectType: SubjectTypeEnum.Presentable, licensorId: nodeId?.toString(),
            [signUserIdentityType === 1 ? 'licensorOwnerId' : 'licenseeOwnerId']: ctx.userId
        });
        if (keywords?.length) {
            condition.subjectName = {$regex: keywords, $options: 'i'} as any;
        }
        const list = await this.contractService.findSubjectSignGroups(condition);

        ctx.success(list.map(x => {
            return {
                subjectId: x.subjectId,
                subjectName: x.subjectName,
                policyIds: x.policyIds,
                latestSignDate: x.latestSignDate,
                count: x.count,
                isAuth: x.authStatusList.includes(ContractAuthStatusEnum.Authorized)
            };
        }));
    }

    @get('/:contractId')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser | IdentityTypeEnum.InternalClient)
    async show() {
        const {ctx} = this;
        const contractId = ctx.checkParams('contractId').notEmpty().isContractId().value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1, 2]).default(0).value;
        const isTranslate = ctx.checkQuery('isTranslate').optional().toBoolean().default(false).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        let contractInfo = await this.contractService.findById(contractId, projection.join(' '));
        if (contractInfo && isLoadPolicyInfo) {
            contractInfo = await this.contractService.fillContractPolicyInfo([contractInfo], isTranslate).then(first);
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

    @del('/test/deleteContracts')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async deleteClientUserPresentableContract() {

        const {ctx} = this;
        const contractIds = ctx.checkQuery('contractIds').optional().isSplitMongoObjectId().toSplitArray().value;
        const nodeId = ctx.checkQuery('nodeId').optional().toInt().value;
        ctx.validateParams();

        let condition: any = {
            licenseeId: ctx.userId.toString(), licenseeIdentityType: 3, subjectType: 2
        };
        if (contractIds?.length) {
            condition._id = {$in: contractIds};
        }
        if (nodeId) {
            condition.licenseeId = nodeId.toString();
        }
        await this.contractInfoProvider.deleteMany(condition).then(x => ctx.success({
            result: true, deletedLine: x.n
        }));
    }

    // 合约流转记录
    @get('/:contractId/transitionRecords')
    async contractTransitionRecords() {
        const {ctx} = this;
        const contractId = ctx.checkParams('contractId').notEmpty().isContractId().value;
        const isTranslate = ctx.checkQuery('isTranslate').optional().toBoolean().default(false).value;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        ctx.validateParams();

        const recordPageResult = await this.contractService.findIntervalContractTransitionRecords({contractId},
            skip, limit, ['contractId', 'fromState', 'toState', 'eventId', 'eventInfo', 'createDate'], {_id: -1});

        if (isTranslate && recordPageResult.dataList.length) {
            const contractInfo = await this.contractService.findContractById(contractId, true);
            this.contractService.contractTransitionRecordTranslate(contractInfo.policyInfo, recordPageResult);
        }
        ctx.success(recordPageResult);
    }
}
