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
const midway_1 = require("midway");
const vistorIdentityDecorator_1 = require("../../extend/vistorIdentityDecorator");
const egg_freelog_base_1 = require("egg-freelog-base");
const enum_1 = require("../../enum");
const lodash_1 = require("lodash");
const common_regex_1 = require("egg-freelog-base/app/extend/helper/common_regex");
let ContractController = class ContractController {
    async index(ctx) {
        const page = ctx.checkQuery('page').optional().default(1).toInt().gt(0).value;
        const pageSize = ctx.checkQuery('pageSize').optional().default(10).gt(0).lt(101).toInt().value;
        const licensorId = ctx.checkQuery('licensorId').optional().value; // 甲方
        const licenseeId = ctx.checkQuery('licenseeId').optional().value; // 乙方
        const identityType = ctx.checkQuery('identityType').exist().toInt().in([enum_1.IdentityTypeEnum.Licensor, enum_1.IdentityTypeEnum.Licensee]).value; // 当前登录用户是作为甲方or乙方
        const subjectIds = ctx.checkQuery('subjectIds').optional().isSplitMongoObjectId().toSplitArray().default([]).value;
        const subjectType = ctx.checkQuery('subjectType').optional().in([enum_1.SubjectType.Presentable, enum_1.SubjectType.Resource, enum_1.SubjectType.UserGroup]).value;
        const isDefault = ctx.checkQuery('isDefault').optional().toInt().in([0, 1]).value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().toLowercase().value;
        const status = ctx.checkQuery('status').optional().in([enum_1.ContractStatusEnum.Terminated, enum_1.ContractStatusEnum.Executed, enum_1.ContractStatusEnum.Exception]).value;
        const authStatus = ctx.checkQuery('authStatus').optional().toInt().value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1, 2]).default(0).value;
        const licenseeIdentityType = ctx.checkQuery('licenseeIdentityType').optional().toInt().in([enum_1.IdentityType.Resource, enum_1.IdentityType.Node, enum_1.IdentityType.ClientUser]).value;
        const order = ctx.checkQuery('order').optional().in(['asc', 'desc']).default('desc').value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        const condition = {};
        if (identityType === enum_1.IdentityTypeEnum.Licensor) {
            condition.licensorOwnerId = ctx.userId;
        }
        if (identityType === enum_1.IdentityTypeEnum.Licensee) {
            condition.licenseeOwnerId = ctx.userId;
        }
        if (!lodash_1.isUndefined(licenseeIdentityType)) {
            condition.licenseeIdentityType = licenseeIdentityType;
        }
        if (lodash_1.isString(licensorId) && licensorId.length) {
            condition.licensorId = licensorId;
        }
        if (lodash_1.isString(licenseeId) && licenseeId.length) {
            condition.licenseeId = licenseeId;
        }
        if (!lodash_1.isEmpty(subjectIds)) {
            condition.subjectId = { $in: subjectIds };
        }
        if (!lodash_1.isUndefined(subjectType)) {
            condition.subjectType = subjectType;
        }
        if (!lodash_1.isUndefined(isDefault)) {
            condition.sortId = isDefault ? 1 : 0;
        }
        if (!lodash_1.isUndefined(status)) {
            condition.status = status;
        }
        if (!lodash_1.isUndefined(authStatus)) {
            condition.authStatus = authStatus;
        }
        if (lodash_1.isString(keywords) && keywords.length) {
            const searchRegExp = new RegExp(keywords, 'i');
            if (common_regex_1.mongoObjectId.test(keywords)) {
                condition.$or = [{ subjectId: keywords }, { _id: keywords }];
            }
            else {
                condition.$or = [{ contractName: searchRegExp }, { licensorName: searchRegExp }, { licenseeName: searchRegExp }];
            }
        }
        const pageResult = await this.contractService.findPageList(condition, page, pageSize, projection, { createDate: order === 'asc' ? 1 : -1 });
        if (isLoadPolicyInfo) {
            pageResult.dataList = await this.contractService.fillContractPolicyInfo(pageResult.dataList);
        }
        ctx.success(pageResult);
    }
    async list(ctx) {
        const contractIds = ctx.checkQuery('contractIds').optional().isSplitMongoObjectId().toSplitArray().len(1, 300).value;
        const subjectIds = ctx.checkQuery('subjectIds').optional().isSplitMongoObjectId().toSplitArray().len(1, 300).value;
        const subjectType = ctx.checkQuery('subjectType').optional().in([enum_1.SubjectType.Presentable, enum_1.SubjectType.Resource, enum_1.SubjectType.UserGroup]).value;
        const licenseeIdentityType = ctx.checkQuery('licenseeIdentityType').optional().toInt().in([enum_1.IdentityType.Resource, enum_1.IdentityType.Node, enum_1.IdentityType.ClientUser]).value;
        const licensorId = ctx.checkQuery('licensorId').optional().value; // 甲方
        const licenseeId = ctx.checkQuery('licenseeId').optional().value; // 乙方
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1, 2]).default(0).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        const condition = {};
        if ([contractIds, subjectIds].every(lodash_1.isUndefined)) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-required-validate-failed', 'contractIds,subjectIds'));
        }
        if (!lodash_1.isEmpty(contractIds)) {
            condition._id = { $in: contractIds };
        }
        if (!lodash_1.isEmpty(subjectIds)) {
            condition.subjectId = { $in: subjectIds };
        }
        if (lodash_1.isString(licensorId) && licensorId.length) {
            condition.licensorId = licensorId;
        }
        if (lodash_1.isString(licenseeId) && licenseeId.length) {
            condition.licenseeId = licenseeId;
        }
        if (!lodash_1.isUndefined(licenseeIdentityType)) {
            condition.licenseeIdentityType = licenseeIdentityType;
        }
        if (!lodash_1.isUndefined(subjectType)) {
            condition.subjectType = subjectType;
        }
        let dataList = await this.contractService.find(condition, projection.join(' '));
        if (isLoadPolicyInfo) {
            dataList = await this.contractService.fillContractPolicyInfo(dataList);
        }
        ctx.success(dataList);
    }
    async createContract(ctx) {
        const subjectId = ctx.checkBody('subjectId').exist().isMongoObjectId().value;
        const subjectType = ctx.checkBody('subjectType').exist().in([enum_1.SubjectType.Presentable, enum_1.SubjectType.Resource, enum_1.SubjectType.UserGroup]).value;
        const policyId = ctx.checkBody('policyId').exist().isMd5().value;
        const licenseeId = ctx.checkBody('licenseeId').exist().value;
        const licenseeIdentityType = ctx.checkBody('licenseeIdentityType').exist().toInt().in([enum_1.IdentityType.Resource, enum_1.IdentityType.Node, enum_1.IdentityType.ClientUser]).value;
        ctx.validateParams();
        if (licenseeIdentityType === enum_1.IdentityType.ClientUser && licenseeId !== ctx.userId.toString()) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-required-validate-failed', 'licenseeId'));
        }
        await this.contractService.batchSignSubjects([{
                subjectId, policyId
            }], licenseeId, licenseeIdentityType, subjectType).then(contracts => ctx.success(lodash_1.first(contracts)));
    }
    async batchCreateContracts(ctx) {
        const licenseeId = ctx.checkBody('licenseeId').exist().value;
        const subjectType = ctx.checkBody('subjectType').exist().in([enum_1.SubjectType.Presentable, enum_1.SubjectType.Resource, enum_1.SubjectType.UserGroup]).value;
        const subjects = ctx.checkBody('subjects').exist().isArray().value;
        const licenseeIdentityType = ctx.checkBody('licenseeIdentityType').optional().toInt().in([enum_1.IdentityType.Resource, enum_1.IdentityType.Node, enum_1.IdentityType.ClientUser]).value;
        ctx.validateParams();
        const subjectValidateResult = this.batchSignSubjectValidator.validate(subjects);
        if (!lodash_1.isEmpty(subjectValidateResult.errors)) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'policies'), {
                errors: subjectValidateResult.errors
            });
        }
        if (licenseeIdentityType === enum_1.IdentityType.ClientUser && licenseeId !== ctx.userId.toString()) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-required-validate-failed', 'licenseeId'));
        }
        await this.contractService.batchSignSubjects(subjects, licenseeId, licenseeIdentityType, subjectType).then(ctx.success);
    }
    async show(ctx) {
        const contractId = ctx.checkParams('contractId').notEmpty().isContractId().value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1, 2]).default(0).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        let contractInfo = await this.contractService.findById(contractId, projection.join(' '));
        if (contractInfo && isLoadPolicyInfo) {
            contractInfo = await this.contractService.fillContractPolicyInfo([contractInfo]).then(lodash_1.first);
        }
        ctx.success(contractInfo);
    }
    async isCanExecEvent(ctx) {
        const eventId = ctx.checkQuery('eventId').isMd5().exist().value;
        const contractId = ctx.checkParams('contractId').notEmpty().isContractId().value;
        ctx.validateParams();
        const contractInfo = await this.contractService.findById(contractId);
        ctx.entityNullObjectCheck(contractInfo);
        const policyInfo = await this.policyService.findOne({ policyId: contractInfo.policyId });
        const isCanExecEvent = this.contractFsmGenerator.isCanExecEvent(contractInfo, policyInfo, eventId);
        ctx.success({ contractInfo, eventId, isCanExec: isCanExecEvent });
    }
    async setDefault(ctx) {
        const contractId = ctx.checkParams('contractId').notEmpty().isContractId().value;
        ctx.validateParams();
        const contractInfo = await this.contractService.findById(contractId);
        ctx.entityNullObjectCheck(contractInfo);
        if (contractInfo.licenseeId !== ctx.request.userId.toString()) {
            throw new egg_freelog_base_1.AuthorizationError(ctx.gettext('user-authorization-failed'));
        }
        if (contractInfo.licenseeIdentityType !== enum_1.IdentityType.ClientUser) {
            throw new egg_freelog_base_1.ApplicationError('current contract type not support');
        }
        await this.contractService.setDefaultExecContract(contractInfo);
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractController.prototype, "contractFsmGenerator", void 0);
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
    midway_1.get('/'),
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "index", null);
__decorate([
    midway_1.get('/list'),
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "list", null);
__decorate([
    midway_1.post('/'),
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "createContract", null);
__decorate([
    midway_1.post('/batchSign'),
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "batchCreateContracts", null);
__decorate([
    midway_1.get('/:contractId'),
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser | egg_freelog_base_1.InternalClient),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "show", null);
__decorate([
    midway_1.get('/:contractId/isCanExecEvent'),
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser | egg_freelog_base_1.InternalClient),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "isCanExecEvent", null);
__decorate([
    midway_1.put('/:contractId/setDefault'),
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser | egg_freelog_base_1.InternalClient),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "setDefault", null);
ContractController = __decorate([
    midway_1.provide(),
    midway_1.controller('/v2/contracts')
], ContractController);
exports.ContractController = ContractController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvY29udHJhY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQW1FO0FBRW5FLGtGQUFxRTtBQUNyRSx1REFBZ0g7QUFDaEgscUNBQTJGO0FBQzNGLG1DQUE2RDtBQUM3RCxrRkFBOEU7QUFJOUUsSUFBYSxrQkFBa0IsR0FBL0IsTUFBYSxrQkFBa0I7SUFhM0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHO1FBRVgsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUM5RSxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztRQUMvRixNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUs7UUFDdkUsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLO1FBQ3ZFLE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsdUJBQWdCLENBQUMsUUFBUSxF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