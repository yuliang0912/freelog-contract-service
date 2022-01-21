"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractController = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
const outside_api_service_1 = require("../service/outside-api-service");
const freelog_common_func_1 = require("egg-freelog-base/lib/freelog-common-func");
let ContractController = class ContractController {
    ctx;
    policyService;
    contractService;
    batchSignSubjectValidator;
    mongoConditionBuilder;
    buildContractStateMachine;
    outsideApiService;
    contractInfoProvider;
    async index() {
        const { ctx } = this;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        const sort = ctx.checkQuery('sort').ignoreParamWhenEmpty().toSortObject().value;
        const licensorId = ctx.checkQuery('licensorId').optional().value; // 甲方
        const licenseeId = ctx.checkQuery('licenseeId').optional().value; // 乙方
        const identityType = ctx.checkQuery('identityType').exist().toInt().in([1, 2]).value; // 当前登录用户是作为甲方or乙方
        const subjectIds = ctx.checkQuery('subjectIds').optional().isSplitMongoObjectId().toSplitArray().default([]).value;
        const subjectType = ctx.checkQuery('subjectType').optional().toInt().in([egg_freelog_base_1.SubjectTypeEnum.Presentable, egg_freelog_base_1.SubjectTypeEnum.Resource, egg_freelog_base_1.SubjectTypeEnum.UserGroup]).value;
        const isDefault = ctx.checkQuery('isDefault').optional().toInt().in([0, 1]).value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().toLowercase().value;
        const status = ctx.checkQuery('status').optional().toInt().in([egg_freelog_base_1.ContractStatusEnum.Terminated, egg_freelog_base_1.ContractStatusEnum.Executed, egg_freelog_base_1.ContractStatusEnum.Exception]).value;
        const authStatus = ctx.checkQuery('authStatus').optional().toInt().value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1, 2]).default(0).value;
        const isTranslate = ctx.checkQuery('isTranslate').optional().toBoolean().default(false).value;
        const licenseeIdentityType = ctx.checkQuery('licenseeIdentityType').optional().toInt().in([egg_freelog_base_1.ContractLicenseeIdentityTypeEnum.Resource, egg_freelog_base_1.ContractLicenseeIdentityTypeEnum.Node, egg_freelog_base_1.ContractLicenseeIdentityTypeEnum.ClientUser]).value;
        const startDate = ctx.checkQuery('startDate').ignoreParamWhenEmpty().toDate().value;
        const endDate = ctx.checkQuery('endDate').ignoreParamWhenEmpty().toDate().value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        const conditionBuilder = this.mongoConditionBuilder
            .setNumber('status', status)
            .setNumber('authStatus', authStatus)
            .setNumber('subjectType', subjectType)
            .setString('licensorId', licensorId, { isAllowEmptyString: false })
            .setString('licenseeId', licenseeId, { isAllowEmptyString: false })
            .setNumber('licenseeIdentityType', licenseeIdentityType)
            .setNumber('licensorOwnerId', ctx.userId, { isSetProperty: identityType === 1 })
            .setNumber('licenseeOwnerId', ctx.userId, { isSetProperty: identityType === 2 })
            .setArray('subjectId', subjectIds, { isAllowEmptyArray: false, operation: '$in' })
            .setNumber('sortId', isDefault ? 1 : 0, { isSetProperty: !(0, lodash_1.isUndefined)(isDefault) });
        if ((0, lodash_1.isString)(keywords) && keywords.length) {
            const searchRegExp = new RegExp(keywords, 'i');
            if (egg_freelog_base_1.CommonRegex.mongoObjectId.test(keywords)) {
                conditionBuilder.setArray('$or', [{ subjectId: keywords }, { _id: keywords }]);
            }
            else {
                conditionBuilder.setArray('$or', [{ contractName: searchRegExp }, { licensorName: searchRegExp }, { licenseeName: searchRegExp }]);
            }
        }
        if ((0, lodash_1.isDate)(startDate) && (0, lodash_1.isDate)(endDate)) {
            conditionBuilder.setObject('createDate', { $gte: startDate, $lte: endDate });
        }
        else if ((0, lodash_1.isDate)(startDate)) {
            conditionBuilder.setObject('createDate', { $gte: startDate });
        }
        else if ((0, lodash_1.isDate)(endDate)) {
            conditionBuilder.setObject('createDate', { $lte: endDate });
        }
        const pageResult = await this.contractService.findIntervalList(conditionBuilder.value(), skip, limit, projection, sort ?? { createDate: -1 });
        if (isLoadPolicyInfo) {
            pageResult.dataList = await this.contractService.fillContractPolicyInfo(pageResult.dataList, isTranslate);
        }
        ctx.success(pageResult);
    }
    async list() {
        const { ctx } = this;
        const contractIds = ctx.checkQuery('contractIds').optional().isSplitMongoObjectId().toSplitArray().len(1, 300).value;
        const subjectIds = ctx.checkQuery('subjectIds').optional().isSplitMongoObjectId().toSplitArray().len(1, 300).value;
        const subjectType = ctx.checkQuery('subjectType').optional().toInt().in([egg_freelog_base_1.SubjectTypeEnum.Presentable, egg_freelog_base_1.SubjectTypeEnum.Resource, egg_freelog_base_1.SubjectTypeEnum.UserGroup]).value;
        const licenseeIdentityType = ctx.checkQuery('licenseeIdentityType').optional().toInt().in([egg_freelog_base_1.ContractLicenseeIdentityTypeEnum.Resource, egg_freelog_base_1.ContractLicenseeIdentityTypeEnum.Node, egg_freelog_base_1.ContractLicenseeIdentityTypeEnum.ClientUser]).value;
        const licensorId = ctx.checkQuery('licensorId').optional().value; // 甲方
        const licenseeId = ctx.checkQuery('licenseeId').optional().value; // 乙方
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1, 2]).default(0).value;
        const isTranslate = ctx.checkQuery('isTranslate').optional().toBoolean().default(false).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        if ([contractIds, subjectIds].every(lodash_1.isUndefined)) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-required-validate-failed', 'contractIds,subjectIds'));
        }
        const condition = this.mongoConditionBuilder
            .setArray('_id', contractIds, { isAllowEmptyArray: false, operation: '$in' })
            .setArray('subjectId', subjectIds, { isAllowEmptyArray: false, operation: '$in' })
            .setString('licenseeId', licenseeId, { isAllowEmptyString: false })
            .setString('licensorId', licensorId, { isAllowEmptyString: false })
            .setNumber('licenseeIdentityType', licenseeIdentityType)
            .setNumber('subjectType', subjectType)
            .value();
        let dataList = await this.contractService.find(condition, projection.join(' '));
        if (isLoadPolicyInfo) {
            dataList = await this.contractService.fillContractPolicyInfo(dataList, isTranslate);
        }
        ctx.success(dataList);
    }
    async createContract() {
        const { ctx } = this;
        const subjectId = ctx.checkBody('subjectId').exist().isMongoObjectId().value;
        const policyId = ctx.checkBody('policyId').exist().isMd5().value;
        const licenseeId = ctx.checkBody('licenseeId').exist().value;
        // 先限制前端必须传,但是不使用
        ctx.checkBody('subjectType').exist().in([egg_freelog_base_1.SubjectTypeEnum.Presentable]).value;
        ctx.checkBody('licenseeIdentityType').exist().toInt().in([egg_freelog_base_1.ContractLicenseeIdentityTypeEnum.ClientUser]).value;
        ctx.validateParams();
        if (licenseeId.toString() !== ctx.userId.toString()) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-validate-failed', 'licenseeId'));
        }
        await this.contractService.signClientUserPresentable(subjectId, policyId, licenseeId).then(contracts => ctx.success((0, lodash_1.first)(contracts)));
    }
    async batchCreateContracts() {
        const { ctx } = this;
        const licenseeId = ctx.checkBody('licenseeId').exist().value;
        const subjectType = ctx.checkBody('subjectType').exist().in([egg_freelog_base_1.SubjectTypeEnum.Presentable, egg_freelog_base_1.SubjectTypeEnum.Resource, egg_freelog_base_1.SubjectTypeEnum.UserGroup]).value;
        const subjects = ctx.checkBody('subjects').exist().isArray().value;
        const isWaitInitial = ctx.checkBody('isWaitInitial').optional().toBoolean().default(false).value;
        const licenseeIdentityType = ctx.checkBody('licenseeIdentityType').optional().toInt().in([egg_freelog_base_1.ContractLicenseeIdentityTypeEnum.Resource, egg_freelog_base_1.ContractLicenseeIdentityTypeEnum.Node, egg_freelog_base_1.ContractLicenseeIdentityTypeEnum.ClientUser]).value;
        ctx.validateParams();
        const subjectValidateResult = this.batchSignSubjectValidator.validate(subjects);
        if (!(0, lodash_1.isEmpty)(subjectValidateResult.errors)) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'policies'), {
                errors: subjectValidateResult.errors
            });
        }
        if (licenseeIdentityType === egg_freelog_base_1.ContractLicenseeIdentityTypeEnum.ClientUser && licenseeId !== ctx.userId.toString()) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-required-validate-failed', 'licenseeId'));
        }
        await this.contractService.batchSignSubjects(subjects, licenseeId, licenseeIdentityType, subjectType, isWaitInitial).then(ctx.success);
    }
    async count() {
        const { ctx } = this;
        const userIds = ctx.checkQuery('userIds').exist().isSplitNumber().toSplitArray().len(1, 100).value;
        const licenseeIdentityType = ctx.checkQuery('licenseeIdentityType').optional().toInt().default(3).in([1, 2, 3]).value;
        ctx.validateParams();
        const list = await this.contractService.findLicenseeSignCounts(userIds.map(x => parseInt(x, 10)), licenseeIdentityType);
        ctx.success(userIds.map(userId => {
            const record = list.find(x => x.licensorOwnerId.toString() === userId);
            return { userId: parseInt(userId, 10), signedContractCount: record?.count ?? 0 };
        }));
    }
    async subjectSignCount() {
        const { ctx } = this;
        const subjectIds = ctx.checkQuery('subjectIds').exist().toSplitArray().len(1, 300).value;
        const subjectType = ctx.checkQuery('subjectType').optional().toInt().in([egg_freelog_base_1.SubjectTypeEnum.Presentable, egg_freelog_base_1.SubjectTypeEnum.Resource, egg_freelog_base_1.SubjectTypeEnum.UserGroup]).value;
        ctx.validateParams();
        const subjectSignCountMap = await this.contractService.findSubjectSignCounts(subjectType, subjectIds).then(list => {
            return new Map(list.map(x => [x.subjectId, x.count]));
        });
        ctx.success(subjectIds.map(subjectId => {
            return {
                subjectId,
                count: subjectSignCountMap.has(subjectId) ? subjectSignCountMap.get(subjectId) : 0
            };
        }));
    }
    // 标的物签约统计
    async subjectSignStatistics() {
        const { ctx } = this;
        const nodeId = ctx.checkQuery('nodeId').optional().toInt().value;
        const signUserIdentityType = ctx.checkQuery('signUserIdentityType').exist().toInt().in([1, 2]).value;
        ctx.validateParams();
        const condition = (0, freelog_common_func_1.deleteUndefinedFields)({
            subjectType: egg_freelog_base_1.SubjectTypeEnum.Presentable, licensorId: nodeId,
            [signUserIdentityType === 1 ? 'licensorOwnerId' : 'licenseeOwnerId']: ctx.userId
        });
        await this.contractService.findSubjectSignGroups(condition).then(ctx.success);
    }
    async show() {
        const { ctx } = this;
        const contractId = ctx.checkParams('contractId').notEmpty().isContractId().value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1, 2]).default(0).value;
        const isTranslate = ctx.checkQuery('isTranslate').optional().toBoolean().default(false).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        let contractInfo = await this.contractService.findById(contractId, projection.join(' '));
        if (contractInfo && isLoadPolicyInfo) {
            contractInfo = await this.contractService.fillContractPolicyInfo([contractInfo], isTranslate).then(lodash_1.first);
        }
        ctx.success(contractInfo);
    }
    async isCanExecEvent() {
        const { ctx } = this;
        const eventId = ctx.checkQuery('eventId').isMd5().exist().value;
        const contractId = ctx.checkParams('contractId').notEmpty().isContractId().value;
        ctx.validateParams();
        const contractInfo = await this.contractService.findById(contractId);
        ctx.entityNullObjectCheck(contractInfo);
        contractInfo.policyInfo = await this.policyService.findOne({ policyId: contractInfo.policyId });
        const contractFsm = this.buildContractStateMachine(contractInfo);
        const isCanExecEvent = contractFsm.isCanExecEvent(eventId);
        ctx.success({ contractInfo, eventId, isCanExec: isCanExecEvent });
    }
    async setDefault() {
        const { ctx } = this;
        const contractId = ctx.checkParams('contractId').notEmpty().isContractId().value;
        ctx.validateParams();
        const contractInfo = await this.contractService.findById(contractId);
        ctx.entityNullObjectCheck(contractInfo);
        if (contractInfo.licenseeId !== ctx.userId.toString()) {
            throw new egg_freelog_base_1.AuthorizationError(ctx.gettext('user-authorization-failed'));
        }
        if (contractInfo.licenseeIdentityType !== egg_freelog_base_1.ContractLicenseeIdentityTypeEnum.ClientUser) {
            throw new egg_freelog_base_1.ApplicationError('current contract type not support');
        }
        await this.contractService.setDefaultExecContract(contractInfo);
    }
    async deleteClientUserPresentableContract() {
        const { ctx } = this;
        const contractIds = ctx.checkQuery('contractIds').optional().isSplitMongoObjectId().toSplitArray().value;
        const nodeId = ctx.checkQuery('nodeId').optional().toInt().value;
        ctx.validateParams();
        let condition = {
            licenseeId: ctx.userId.toString(), licenseeIdentityType: 3, subjectType: 2
        };
        if (contractIds?.length) {
            condition._id = { $in: contractIds };
        }
        if (nodeId) {
            condition.licenseeId = nodeId.toString();
        }
        await this.contractInfoProvider.deleteMany(condition).then(x => ctx.success({
            result: true, deletedLine: x.n
        }));
    }
    async contractTransitionRecords() {
        const { ctx } = this;
        const contractId = ctx.checkParams('contractId').notEmpty().isContractId().value;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        ctx.validateParams();
        await this.contractService.findIntervalContractTransitionRecords({
            contractId
        }, skip, limit, ['contractId', 'fromState', 'toState', 'eventId', 'createDate'], { _id: -1 }).then(ctx.success);
    }
};
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ContractController.prototype, "ctx", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ContractController.prototype, "policyService", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ContractController.prototype, "contractService", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ContractController.prototype, "batchSignSubjectValidator", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ContractController.prototype, "mongoConditionBuilder", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Function)
], ContractController.prototype, "buildContractStateMachine", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", outside_api_service_1.OutsideApiService)
], ContractController.prototype, "outsideApiService", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ContractController.prototype, "contractInfoProvider", void 0);
__decorate([
    (0, midway_1.get)('/'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "index", null);
__decorate([
    (0, midway_1.get)('/list'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser | egg_freelog_base_1.IdentityTypeEnum.InternalClient),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "list", null);
__decorate([
    (0, midway_1.post)('/'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "createContract", null);
__decorate([
    (0, midway_1.post)('/batchSign'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "batchCreateContracts", null);
__decorate([
    (0, midway_1.get)('/count'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser | egg_freelog_base_1.IdentityTypeEnum.InternalClient),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "count", null);
__decorate([
    (0, midway_1.get)('/subjects/signCount'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "subjectSignCount", null);
__decorate([
    (0, midway_1.get)('/subjects/presentables/signStatistics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "subjectSignStatistics", null);
__decorate([
    (0, midway_1.get)('/:contractId'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser | egg_freelog_base_1.IdentityTypeEnum.InternalClient),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "show", null);
__decorate([
    (0, midway_1.get)('/:contractId/isCanExecEvent'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser | egg_freelog_base_1.IdentityTypeEnum.InternalClient),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "isCanExecEvent", null);
__decorate([
    (0, midway_1.put)('/:contractId/setDefault'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser | egg_freelog_base_1.IdentityTypeEnum.InternalClient),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "setDefault", null);
__decorate([
    (0, midway_1.del)('/test/deleteContracts'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "deleteClientUserPresentableContract", null);
__decorate([
    (0, midway_1.get)('/:contractId/transitionRecords'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "contractTransitionRecords", null);
ContractController = __decorate([
    (0, midway_1.provide)(),
    (0, midway_1.controller)('/v2/contracts')
], ContractController);
exports.ContractController = ContractController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvY29udHJhY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQXFFO0FBQ3JFLG1DQUF3RTtBQVF4RSx1REFhMEI7QUFDMUIsd0VBQWlFO0FBQ2pFLGtGQUErRTtBQUkvRSxJQUFhLGtCQUFrQixHQUEvQixNQUFhLGtCQUFrQjtJQUczQixHQUFHLENBQWlCO0lBRXBCLGFBQWEsQ0FBaUI7SUFFOUIsZUFBZSxDQUFtQjtJQUVsQyx5QkFBeUIsQ0FBc0I7SUFFL0MscUJBQXFCLENBQXlCO0lBRTlDLHlCQUF5QixDQUF3RDtJQUVqRixpQkFBaUIsQ0FBb0I7SUFFckMsb0JBQW9CLENBQWtDO0lBSXRELEtBQUssQ0FBQyxLQUFLO1FBQ1AsTUFBTSxFQUFDLEdBQUcsRUFBQyxHQUFHLElBQUksQ0FBQztRQUVuQixNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzlFLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ3pGLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDaEYsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FB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