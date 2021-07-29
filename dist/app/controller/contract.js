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
let ContractController = class ContractController {
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
            .setNumber('sortId', isDefault ? 1 : 0, { isSetProperty: !lodash_1.isUndefined(isDefault) });
        if (lodash_1.isString(keywords) && keywords.length) {
            const searchRegExp = new RegExp(keywords, 'i');
            if (egg_freelog_base_1.CommonRegex.mongoObjectId.test(keywords)) {
                conditionBuilder.setArray('$or', [{ subjectId: keywords }, { _id: keywords }]);
            }
            else {
                conditionBuilder.setArray('$or', [{ contractName: searchRegExp }, { licensorName: searchRegExp }, { licenseeName: searchRegExp }]);
            }
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
        await this.contractService.signClientUserPresentable(subjectId, policyId, licenseeId).then(contracts => ctx.success(lodash_1.first(contracts)));
    }
    async batchCreateContracts() {
        const { ctx } = this;
        const licenseeId = ctx.checkBody('licenseeId').exist().value;
        const subjectType = ctx.checkBody('subjectType').exist().in([egg_freelog_base_1.SubjectTypeEnum.Presentable, egg_freelog_base_1.SubjectTypeEnum.Resource, egg_freelog_base_1.SubjectTypeEnum.UserGroup]).value;
        const subjects = ctx.checkBody('subjects').exist().isArray().value;
        const licenseeIdentityType = ctx.checkBody('licenseeIdentityType').optional().toInt().in([egg_freelog_base_1.ContractLicenseeIdentityTypeEnum.Resource, egg_freelog_base_1.ContractLicenseeIdentityTypeEnum.Node, egg_freelog_base_1.ContractLicenseeIdentityTypeEnum.ClientUser]).value;
        ctx.validateParams();
        const subjectValidateResult = this.batchSignSubjectValidator.validate(subjects);
        if (!lodash_1.isEmpty(subjectValidateResult.errors)) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'policies'), {
                errors: subjectValidateResult.errors
            });
        }
        if (licenseeIdentityType === egg_freelog_base_1.ContractLicenseeIdentityTypeEnum.ClientUser && licenseeId !== ctx.userId.toString()) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-required-validate-failed', 'licenseeId'));
        }
        await this.contractService.batchSignSubjects(subjects, licenseeId, licenseeIdentityType, subjectType, false).then(ctx.success);
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
    /**
     * 合约流转记录
     */
    async contractTransitionRecords() {
        const { ctx } = this;
        const contractId = ctx.checkParams('contractId').notEmpty().isContractId().value;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        ctx.validateParams();
        await this.contractService.findIntervalContractTransitionRecords({
            contractId, eventId: { $ne: 'init' }
        }, skip, limit, ['contractId', 'fromState', 'toState', 'eventId', 'createDate']).then(ctx.success);
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractController.prototype, "ctx", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractController.prototype, "policyService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractController.prototype, "contractService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractController.prototype, "batchSignSubjectValidator", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractController.prototype, "mongoConditionBuilder", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Function)
], ContractController.prototype, "buildContractStateMachine", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", outside_api_service_1.OutsideApiService)
], ContractController.prototype, "outsideApiService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractController.prototype, "contractInfoProvider", void 0);
__decorate([
    midway_1.get('/'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "index", null);
__decorate([
    midway_1.get('/list'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser | egg_freelog_base_1.IdentityTypeEnum.InternalClient),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "list", null);
__decorate([
    midway_1.post('/'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "createContract", null);
__decorate([
    midway_1.post('/batchSign'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "batchCreateContracts", null);
__decorate([
    midway_1.get('/count'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser | egg_freelog_base_1.IdentityTypeEnum.InternalClient),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "count", null);
__decorate([
    midway_1.get('/:contractId'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser | egg_freelog_base_1.IdentityTypeEnum.InternalClient),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "show", null);
__decorate([
    midway_1.get('/:contractId/isCanExecEvent'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser | egg_freelog_base_1.IdentityTypeEnum.InternalClient),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "isCanExecEvent", null);
__decorate([
    midway_1.put('/:contractId/setDefault'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser | egg_freelog_base_1.IdentityTypeEnum.InternalClient),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "setDefault", null);
__decorate([
    midway_1.del('/test/deleteContracts'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "deleteClientUserPresentableContract", null);
__decorate([
    midway_1.get('/:contractId/transitionRecords'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "contractTransitionRecords", null);
ContractController = __decorate([
    midway_1.provide(),
    midway_1.controller('/v2/contracts')
], ContractController);
exports.ContractController = ContractController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvY29udHJhY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQTZEO0FBQzdELG1DQUF3RTtBQUt4RSx1REFJMEI7QUFDMUIsd0VBQWlFO0FBSWpFLElBQWEsa0JBQWtCLEdBQS9CLE1BQWEsa0JBQWtCO0lBcUIzQixLQUFLLENBQUMsS0FBSztRQUNQLE1BQU0sRUFBQyxHQUFHLEVBQUMsR0FBRyxJQUFJLENBQUM7UUFFbkIsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUM5RSxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUN6RixNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLG9CQUFvQixFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ2hGLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSztRQUN2RSxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUs7UUFDdkUsTUFBTSxZQUFZ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