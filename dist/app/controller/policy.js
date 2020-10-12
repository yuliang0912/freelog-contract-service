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
const lodash_1 = require("lodash");
const enum_1 = require("../../enum");
const egg_freelog_base_1 = require("egg-freelog-base");
const vistorIdentityDecorator_1 = require("../../extend/vistorIdentityDecorator");
const midway_1 = require("midway");
let PolicyController = class PolicyController {
    async list(ctx) {
        const policyIds = ctx.checkQuery('policyIds').exist().isSplitMd5().toSplitArray().len(1, 200).value;
        const subjectType = ctx.checkQuery('subjectType').optional().toInt().in([enum_1.SubjectType.Presentable, enum_1.SubjectType.Resource, enum_1.SubjectType.UserGroup]).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        const condition = { policyId: { $in: policyIds } };
        if (lodash_1.isNumber(subjectType)) {
            condition.subjectType = subjectType;
        }
        await this.policyService.find(condition, projection.join(' ')).then(ctx.success);
    }
    // @post('/')
    // @visitorIdentity(InternalClient | LoginUser)
    // async create(ctx) {
    //
    //     const policyText = ctx.checkBody('policyText').exist().type('string').value;
    //     const subjectType = ctx.checkBody('subjectType').exist().toInt().in([SubjectType.UserGroup, SubjectType.Resource, SubjectType.Presentable]).value;
    //     ctx.validateParams();
    //
    //     await this.policyService.findOrCreatePolicy(subjectType, policyText).then(ctx.success);
    // }
    async batchCreate(ctx) {
        const policyTexts = ctx.checkBody('policyTexts').exist().isArray().len(1, 100).value;
        const subjectType = ctx.checkBody('subjectType').exist().toInt().in([enum_1.SubjectType.UserGroup, enum_1.SubjectType.Resource, enum_1.SubjectType.Presentable]).value;
        ctx.validateParams();
        await this.policyService.findOrCreatePolicies(subjectType, policyTexts.map(decodeURIComponent)).then(ctx.success);
    }
    async show(ctx) {
        const policyId = ctx.checkParams('policyId').exist().isMd5().value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        await this.policyService.findOne({ policyId }, projection.join(' ')).then(ctx.success);
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], PolicyController.prototype, "policyService", void 0);
__decorate([
    midway_1.get('/list'),
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PolicyController.prototype, "list", null);
__decorate([
    midway_1.post('/'),
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.InternalClient | egg_freelog_base_1.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PolicyController.prototype, "batchCreate", null);
__decorate([
    midway_1.get('/:policyId'),
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.InternalClient | egg_freelog_base_1.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PolicyController.prototype, "show", null);
PolicyController = __decorate([
    midway_1.provide(),
    midway_1.controller('/v2/policies')
], PolicyController);
exports.PolicyController = PolicyController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9saWN5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9jb250cm9sbGVyL3BvbGljeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBZ0M7QUFDaEMscUNBQXVDO0FBRXZDLHVEQUEyRDtBQUMzRCxrRkFBcUU7QUFDckUsbUNBQThEO0FBSTlELElBQWEsZ0JBQWdCLEdBQTdCLE1BQWEsZ0JBQWdCO0lBT3pCLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRztRQUVWLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDcEcsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxrQkFBVyxDQUFDLFdBQVcsRUFBRSxrQkFBVyxDQUFDLFFBQVEsRUFBRSxrQkFBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ3RKLE1BQU0sVUFBVSxHQUFhLEdBQUcsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUN0RyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFckIsTUFBTSxTQUFTLEdBQVEsRUFBQyxRQUFRLEVBQUUsRUFBQyxHQUFHLEVBQUUsU0FBUyxFQUFDLEVBQUMsQ0FBQztRQUNwRCxJQUFJLGlCQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDdkIsU0FBUyxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7U0FDdkM7UUFD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