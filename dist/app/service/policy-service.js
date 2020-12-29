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
exports.PolicyService = void 0;
const midway_1 = require("midway");
let PolicyService = class PolicyService {
    /**
     * 查找或者创建策略
     * @param subjectType
     * @param policyText
     */
    async findOrCreatePolicy(subjectType, policyText) {
        const policyInfo = this.policyCompiler.compiler(subjectType, policyText);
        const existingPolicy = await this.policyInfoProvider.findOne({ policyId: policyInfo.policyId });
        if (existingPolicy) {
            return existingPolicy;
        }
        return this.policyInfoProvider.create({
            subjectType,
            policyId: policyInfo.policyId,
            policyText: policyInfo.policyText,
            fsmDescriptionInfo: policyInfo.fsmDescriptionInfo
        });
    }
    /**
     * 创建策略(按顺序返回)
     * @param subjectType
     * @param policyTexts
     */
    async findOrCreatePolicies(subjectType, policyTexts) {
        const policyList = policyTexts.map(policyText => this.policyCompiler.compiler(subjectType, policyText));
        const policyIds = policyList.map(x => x.policyId);
        const existingPolicyMap = await this.find({ policyId: { $in: policyIds } }).then(list => {
            return new Map(list.map(x => [x.policyId, x]));
        });
        const batchWriteObjects = [];
        for (const policyInfo of policyList) {
            if (existingPolicyMap.has(policyInfo.policyId)) {
                continue;
            }
            batchWriteObjects.push({
                subjectType,
                policyId: policyInfo.policyId,
                policyText: policyInfo.policyText,
                fsmDescriptionInfo: policyInfo.fsmDescriptionInfo
            });
        }
        await this.policyInfoProvider.insertMany(batchWriteObjects);
        return policyList;
    }
    async count(condition) {
        return this.policyInfoProvider.count(condition);
    }
    async findOne(condition, ...args) {
        return this.policyInfoProvider.findOne(condition, ...args);
    }
    async find(condition, ...args) {
        return this.policyInfoProvider.find(condition, ...args);
    }
    async findByIds(policyIds, ...args) {
        return this.policyInfoProvider.find({ policyId: { $in: policyIds } }, ...args);
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], PolicyService.prototype, "ctx", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], PolicyService.prototype, "policyCompiler", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], PolicyService.prototype, "policyInfoProvider", void 0);
PolicyService = __decorate([
    midway_1.provide('policyService')
], PolicyService);
exports.PolicyService = PolicyService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9saWN5LXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL3NlcnZpY2UvcG9saWN5LXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQXVDO0FBS3ZDLElBQWEsYUFBYSxHQUExQixNQUFhLGFBQWE7SUFTdEI7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxXQUE0QixFQUFFLFVBQWtCO1FBRXJFLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN6RSxNQUFNLGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsRUFBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLFFBQVEsRUFBQyxDQUFDLENBQUM7UUFDOUYsSUFBSSxjQUFjLEVBQUU7WUFDaEIsT0FBTyxjQUFjLENBQUM7U0FDekI7UUFFRCxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUM7WUFDbEMsV0FBVztZQUNYLFFBQVEsRUFBRSxVQUFVLENBQUMsUUFBUTtZQUM3QixVQUFVLEVBQUUsVUFBVSxDQUFDLFVBQVU7WUFDakMsa0JBQWtCLEVBQUUsVUFBVSxDQUFDLGtCQUFrQjtTQUNwRCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxXQUE0QixFQUFFLFdBQXFCO1FBRTFFLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUN4RyxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xELE1BQU0saUJBQWlCLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUMsUUFBUSxFQUFFLEVBQUMsR0FBRyxFQUFFLFNBQVMsRUFBQyxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDaEYsT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuRCxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0saUJBQWlCLEdBQUcsRUFBRSxDQUFDO1FBQzdCLEtBQUssTUFBTSxVQUFVLElBQUksVUFBVSxFQUFFO1lBQ2pDLElBQUksaUJBQWlCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDNUMsU0FBUzthQUNaO1lBQ0QsaUJBQWlCLENBQUMsSUFBSSxDQUFDO2dCQUNuQixXQUFXO2dCQUNYLFFBQVEsRUFBRSxVQUFVLENBQUMsUUFBUTtnQkFDN0IsVUFBVSxFQUFFLFVBQVUsQ0FBQyxVQUFVO2dCQUNqQyxrQkFBa0IsRUFBRSxVQUFVLENBQUMsa0JBQWtCO2FBQ3BELENBQUMsQ0FBQztTQUNOO1FBQ0QsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDNUQsT0FBTyxVQUFVLENBQUM7SUFDdEIsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBaUI7UUFDekIsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQWlCLEVBQUUsR0FBRyxJQUFJO1FBQ3BDLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFpQixFQUFFLEdBQUcsSUFBSTtRQUNqQyxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBbUIsRUFBRSxHQUFHLElBQUk7UUFDeEMsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEVBQUMsUUFBUSxFQUFFLEVBQUMsR0FBRyxFQUFFLFNBQVMsRUFBQyxFQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUMvRSxDQUFDO0NBQ0osQ0FBQTtBQXRFRztJQURDLGVBQU0sRUFBRTs7MENBQ1c7QUFFcEI7SUFEQyxlQUFNLEVBQUU7O3FEQUN1QjtBQUVoQztJQURDLGVBQU0sRUFBRTs7eURBQ1U7QUFQVixhQUFhO0lBRHpCLGdCQUFPLENBQUMsZUFBZSxDQUFDO0dBQ1osYUFBYSxDQXlFekI7QUF6RVksc0NBQWEifQ==