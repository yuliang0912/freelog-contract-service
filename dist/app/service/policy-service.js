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
        const policyInfo = await this.policyCompiler.compiler(subjectType, policyText);
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
        const policyList = await Promise.all(policyTexts.map(async (policyText) => this.policyCompiler.compiler(subjectType, policyText)));
        const policyIds = policyList.map(x => x.policyId);
        const existingPolicyMap = await this.find({ policyId: { $in: policyIds } }).then(list => {
            return new Map(list.map(x => [x.policyId, x]));
        });
        const batchWriteObjects = policyList.filter(x => !existingPolicyMap.has(x.policyId));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9saWN5LXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL3NlcnZpY2UvcG9saWN5LXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQXVDO0FBS3ZDLElBQWEsYUFBYSxHQUExQixNQUFhLGFBQWE7SUFTdEI7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxXQUE0QixFQUFFLFVBQWtCO1FBRXJFLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQy9FLE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxFQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQztRQUM5RixJQUFJLGNBQWMsRUFBRTtZQUNoQixPQUFPLGNBQWMsQ0FBQztTQUN6QjtRQUVELE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQztZQUNsQyxXQUFXO1lBQ1gsUUFBUSxFQUFFLFVBQVUsQ0FBQyxRQUFRO1lBQzdCLFVBQVUsRUFBRSxVQUFVLENBQUMsVUFBVTtZQUNqQyxrQkFBa0IsRUFBRSxVQUFVLENBQUMsa0JBQWtCO1NBQ3BELENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLG9CQUFvQixDQUFDLFdBQTRCLEVBQUUsV0FBcUI7UUFFMUUsTUFBTSxVQUFVLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFDLFVBQVUsRUFBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqSSxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xELE1BQU0saUJBQWlCLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUMsUUFBUSxFQUFFLEVBQUMsR0FBRyxFQUFFLFNBQVMsRUFBQyxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDaEYsT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuRCxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0saUJBQWlCLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3JGLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzVELE9BQU8sVUFBVSxDQUFDO0lBQ3RCLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQWlCO1FBQ3pCLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFpQixFQUFFLEdBQUcsSUFBSTtRQUNwQyxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBaUIsRUFBRSxHQUFHLElBQUk7UUFDakMsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQW1CLEVBQUUsR0FBRyxJQUFJO1FBQ3hDLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUFDLFFBQVEsRUFBRSxFQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUMsRUFBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDL0UsQ0FBQztDQUNKLENBQUE7QUEzREc7SUFEQyxlQUFNLEVBQUU7OzBDQUNXO0FBRXBCO0lBREMsZUFBTSxFQUFFOztxREFDdUI7QUFFaEM7SUFEQyxlQUFNLEVBQUU7O3lEQUN5QztBQVB6QyxhQUFhO0lBRHpCLGdCQUFPLENBQUMsZUFBZSxDQUFDO0dBQ1osYUFBYSxDQThEekI7QUE5RFksc0NBQWEifQ==