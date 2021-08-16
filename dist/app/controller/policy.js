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
const lodash_1 = require("lodash");
let PolicyController = class PolicyController {
    async list() {
        const { ctx } = this;
        const policyIds = ctx.checkQuery('policyIds').exist().isSplitMd5().toSplitArray().len(1, 200).value;
        const subjectType = ctx.checkQuery('subjectType').optional().toInt().in([egg_freelog_base_1.SubjectTypeEnum.Presentable, egg_freelog_base_1.SubjectTypeEnum.Resource, egg_freelog_base_1.SubjectTypeEnum.UserGroup]).value;
        const isTranslate = ctx.checkQuery('isTranslate').optional().toBoolean().default(false).value;
        let projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        const condition = this.mongoConditionBuilder
            .setArray('policyId', policyIds)
            .setNumber('subjectType', subjectType).value();
        if (isTranslate) {
            projection = [];
        }
        const policies = await this.policyService.find(condition, projection.join(' '));
        if (!isTranslate) {
            return ctx.success(policies);
        }
        ctx.success(this.policyService.policyTranslate(policies));
    }
    async batchCreate() {
        const { ctx } = this;
        const policyTexts = ctx.checkBody('policyTexts').exist().isArray().len(1, 100).value;
        const subjectType = ctx.checkBody('subjectType').exist().toInt().in([egg_freelog_base_1.SubjectTypeEnum.UserGroup, egg_freelog_base_1.SubjectTypeEnum.Resource, egg_freelog_base_1.SubjectTypeEnum.Presentable]).value;
        ctx.validateParams();
        await this.policyService.findOrCreatePolicies(subjectType, policyTexts.map(decodeURIComponent)).then(ctx.success);
    }
    // @get('/convert')
    // async convert() {
    //     const policyList = await this.policyService.find({status: 0}) as any[];
    //     for (const policy of policyList) {
    //         const fsmDescriptionInfo = policy.fsmDescriptionInfo;
    //         for (const [_, stateInfo] of Object.entries(fsmDescriptionInfo)) {
    //             const transitions = [];
    //             for (const [toState, eventInfo] of Object.entries(stateInfo['transition'] || {})) {
    //                 if (!eventInfo) {
    //                     continue;
    //                 }
    //                 eventInfo['toState'] = toState;
    //                 transitions.push(eventInfo);
    //             }
    //             stateInfo['transitions'] = transitions;
    //             delete stateInfo['transition'];
    //         }
    //         await policy.updateOne({fsmDescriptionInfo});
    //     }
    //     this.ctx.success(1);
    // }
    async show() {
        const { ctx } = this;
        const policyId = ctx.checkParams('policyId').exist().isMd5().value;
        let projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        const isTranslate = ctx.checkQuery('isTranslate').optional().toBoolean().default(false).value;
        ctx.validateParams();
        if (isTranslate) {
            projection = [];
        }
        const policyInfo = await this.policyService.findOne({ policyId }, projection.join(' '));
        if (!isTranslate) {
            return ctx.success(policyInfo);
        }
        ctx.success(lodash_1.first(this.policyService.policyTranslate([policyInfo])));
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
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PolicyController.prototype, "show", null);
PolicyController = __decorate([
    midway_1.provide(),
    midway_1.controller('/v2/policies')
], PolicyController);
exports.PolicyController = PolicyController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9saWN5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9jb250cm9sbGVyL3BvbGljeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFDQSxtQ0FBOEQ7QUFDOUQsdURBQTZHO0FBQzdHLG1DQUE2QjtBQUk3QixJQUFhLGdCQUFnQixHQUE3QixNQUFhLGdCQUFnQjtJQVV6QixLQUFLLENBQUMsSUFBSTtRQUVOLE1BQU0sRUFBQyxHQUFHLEVBQUMsR0FBRyxJQUFJLENBQUM7UUFDbkIsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUNwRyxNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGtDQUFlLENBQUMsV0FBVyxFQUFFLGtDQUFlLENBQUMsUUFBUSxFQUFFLGtDQUFlLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDbEssTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzlGLElBQUksVUFBVSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUMxRixHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFckIsTUFBTSxTQUFTLEdBQUcsSUFBSSxD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