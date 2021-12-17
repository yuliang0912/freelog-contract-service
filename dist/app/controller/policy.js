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
    ctx;
    policyService;
    mongoConditionBuilder;
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
        ctx.success((0, lodash_1.first)(this.policyService.policyTranslate([policyInfo])));
    }
};
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], PolicyController.prototype, "ctx", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], PolicyController.prototype, "policyService", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], PolicyController.prototype, "mongoConditionBuilder", void 0);
__decorate([
    (0, midway_1.get)('/list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PolicyController.prototype, "list", null);
__decorate([
    (0, midway_1.post)('/'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.InternalClient | egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PolicyController.prototype, "batchCreate", null);
__decorate([
    (0, midway_1.get)('/:policyId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PolicyController.prototype, "show", null);
PolicyController = __decorate([
    (0, midway_1.provide)(),
    (0, midway_1.controller)('/v2/policies')
], PolicyController);
exports.PolicyController = PolicyController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9saWN5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9jb250cm9sbGVyL3BvbGljeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFDQSxtQ0FBOEQ7QUFDOUQsdURBQTZHO0FBQzdHLG1DQUE2QjtBQUk3QixJQUFhLGdCQUFnQixHQUE3QixNQUFhLGdCQUFnQjtJQUd6QixHQUFHLENBQWlCO0lBRXBCLGFBQWEsQ0FBaUI7SUFFOUIscUJBQXFCLENBQXlCO0lBRzlDLEtBQUssQ0FBQyxJQUFJO1FBRU4sTUFBTSxFQUFDLEdBQUcsRUFBQyxHQUFHLElBQUksQ0FBQztRQUNuQixNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ3BHLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsa0NBQWUsQ0FBQyxXQUFXLEVBQUUsa0NBQWUsQ0FBQyxRQUFRLEVBQUUsa0NBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUNsSyxNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDOUYsSUFBSSxVQUFVLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzFGLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUVyQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMscUJBQXFCO2FBQ3ZDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDO2FBQy9CLFNBQVMsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFbkQsSUFBSSxXQUFXLEVBQUU7WUFDYixVQUFVLEdBQUcsRUFBRSxDQUFDO1NBQ25CO1FBQ0QsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDZCxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDaEM7UUFFRCxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUlELEtBQUssQ0FBQyxXQUFXO1FBRWIsTUFBTSxFQUFDLEdBQUcsRUFBQyxHQUFHLElBQUksQ0FBQztRQUNuQixNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ3JGLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsa0NBQWUsQ0FBQyxTQUFTLEVBQUUsa0NBQWUsQ0FBQyxRQUFRLEVBQUUsa0NBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUM5SixHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFckIsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3RILENBQUM7SUFFRCxtQkFBbUI7SUFDbkIsb0JBQW9CO0lBQ3BCLDhFQUE4RTtJQUM5RSx5Q0FBeUM7SUFDekMsZ0VBQWdFO0lBQ2hFLDZFQUE2RTtJQUM3RSxzQ0FBc0M7SUFDdEMsa0dBQWtHO0lBQ2xHLG9DQUFvQztJQUNwQyxnQ0FBZ0M7SUFDaEMsb0JBQW9CO0lBQ3BCLGtEQUFrRDtJQUNsRCwrQ0FBK0M7SUFDL0MsZ0JBQWdCO0lBQ2hCLHNEQUFzRDtJQUN0RCw4Q0FBOEM7SUFDOUMsWUFBWTtJQUNaLHdEQUF3RDtJQUN4RCxRQUFRO0lBQ1IsMkJBQTJCO0lBQzNCLElBQUk7SUFHSixLQUFLLENBQUMsSUFBSTtRQUVOLE1BQU0sRUFBQyxHQUFHLEVBQUMsR0FBRyxJQUFJLENBQUM7UUFDbkIsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDbkUsSUFBSSxVQUFVLEdBQWEsR0FBRyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ3BHLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUM5RixHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFckIsSUFBSSxXQUFXLEVBQUU7WUFDYixVQUFVLEdBQUcsRUFBRSxDQUFDO1NBQ25CO1FBQ0QsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFDLFFBQVEsRUFBQyxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN0RixJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2QsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ2xDO1FBQ0QsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFBLGNBQUssRUFBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7Q0FDSixDQUFBO0FBbkZHO0lBREMsSUFBQSxlQUFNLEdBQUU7OzZDQUNXO0FBRXBCO0lBREMsSUFBQSxlQUFNLEdBQUU7O3VEQUNxQjtBQUU5QjtJQURDLElBQUEsZUFBTSxHQUFFOzsrREFDcUM7QUFHOUM7SUFEQyxJQUFBLFlBQUcsRUFBQyxPQUFPLENBQUM7Ozs7NENBdUJaO0FBSUQ7SUFGQyxJQUFBLGFBQUksRUFBQyxHQUFHLENBQUM7SUFDVCxJQUFBLDJDQUF3QixFQUFDLG1DQUFnQixDQUFDLGNBQWMsR0FBRyxtQ0FBZ0IsQ0FBQyxTQUFTLENBQUM7Ozs7bURBU3RGO0FBeUJEO0lBREMsSUFBQSxZQUFHLEVBQUMsWUFBWSxDQUFDOzs7OzRDQWlCakI7QUFyRlEsZ0JBQWdCO0lBRjVCLElBQUEsZ0JBQU8sR0FBRTtJQUNULElBQUEsbUJBQVUsRUFBQyxjQUFjLENBQUM7R0FDZCxnQkFBZ0IsQ0FzRjVCO0FBdEZZLDRDQUFnQiJ9