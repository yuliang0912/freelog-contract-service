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
exports.PolicyController = void 0;
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
let PolicyController = class PolicyController {
    async list() {
        const { ctx } = this;
        const policyIds = ctx.checkQuery('policyIds').exist().isSplitMd5().toSplitArray().len(1, 200).value;
        const subjectType = ctx.checkQuery('subjectType').optional().toInt().in([egg_freelog_base_1.SubjectTypeEnum.Presentable, egg_freelog_base_1.SubjectTypeEnum.Resource, egg_freelog_base_1.SubjectTypeEnum.UserGroup]).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        const condition = this.mongoConditionBuilder
            .setArray('policyId', policyIds)
            .setNumber('subjectType', subjectType).value();
        await this.policyService.find(condition, projection.join(' ')).then(ctx.success);
    }
    async batchCreate() {
        const { ctx } = this;
        const policyTexts = ctx.checkBody('policyTexts').exist().isArray().len(1, 100).value;
        const subjectType = ctx.checkBody('subjectType').exist().toInt().in([egg_freelog_base_1.SubjectTypeEnum.UserGroup, egg_freelog_base_1.SubjectTypeEnum.Resource, egg_freelog_base_1.SubjectTypeEnum.Presentable]).value;
        ctx.validateParams();
        await this.policyService.findOrCreatePolicies(subjectType, policyTexts.map(decodeURIComponent)).then(ctx.success);
    }
    async show() {
        const { ctx } = this;
        const policyId = ctx.checkParams('policyId').exist().isMd5().value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        await this.policyService.findOne({ policyId }, projection.join(' ')).then(ctx.success);
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], PolicyController.prototype, "ctx", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], PolicyController.prototype, "policyService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], PolicyController.prototype, "mongoConditionBuilder", void 0);
__decorate([
    midway_1.get('/list'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PolicyController.prototype, "list", null);
__decorate([
    midway_1.post('/'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.InternalClient | egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PolicyController.prototype, "batchCreate", null);
__decorate([
    midway_1.get('/:policyId'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.InternalClient | egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PolicyController.prototype, "show", null);
PolicyController = __decorate([
    midway_1.provide(),
    midway_1.controller('/v2/policies')
], PolicyController);
exports.PolicyController = PolicyController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9saWN5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9jb250cm9sbGVyL3BvbGljeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFDQSxtQ0FBOEQ7QUFDOUQsdURBQTZHO0FBSTdHLElBQWEsZ0JBQWdCLEdBQTdCLE1BQWEsZ0JBQWdCO0lBV3pCLEtBQUssQ0FBQyxJQUFJO1FBRU4sTUFBTSxFQUFDLEdBQUcsRUFBQyxHQUFHLElBQUksQ0FBQztRQUNuQixNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ3BHLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsa0NBQWUsQ0FBQyxXQUFXLEVBQUUsa0NBQWUsQ0FBQyxRQUFRLEVBQUUsa0NBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUNsSyxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDNUYsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXJCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxxQkFBcUI7YUFDdkMsUUFBUSxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUM7YUFDL0IsU0FBUyxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUVuRCxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMs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