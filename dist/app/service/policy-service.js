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
     * @param {SubjectType} subjectType
     * @param {string} policyName
     * @param {string} policyText
     * @returns {Promise<ContractPolicyInfo>}
     */
    async findOrCreatePolicy(subjectType, policyName, policyText) {
        const userId = this.ctx.userId;
        const policyInfo = this.policyCompiler.compiler(userId, subjectType, policyText, policyName);
        const existingPolicy = await this.policyInfoProvider.findOne({ policyId: policyInfo.policyId });
        if (existingPolicy) {
            return existingPolicy;
        }
        return this.policyInfoProvider.create({
            subjectType, userId,
            policyId: policyInfo.policyId,
            policyName: policyInfo.policyName,
            policyText: policyInfo.policyText,
            fsmDescriptionInfo: policyInfo.fsmDescriptionInfo
        });
    }
    async count(condition) {
        return this.policyInfoProvider.count(condition);
    }
    async findPageList(condition, page, pageSize, projection, orderBy) {
        let dataList = [];
        const totalItem = await this.count(condition);
        if (totalItem > (page - 1) * pageSize) {
            dataList = await this.policyInfoProvider.findPageList(condition, page, pageSize, projection.join(' '), orderBy);
        }
        return { page, pageSize, totalItem, dataList };
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
    async updatePolicy(policyInfo, policyName) {
        return this.policyInfoProvider.updateOne({
            policyId: policyInfo.policyId
        }, { policyName }).then(data => Boolean(data.ok));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9saWN5LXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL3NlcnZpY2UvcG9saWN5LXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQXVDO0FBTXZDLElBQWEsYUFBYSxHQUExQixNQUFhLGFBQWE7SUFTdEI7Ozs7OztPQU1HO0lBQ0gsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFdBQXdCLEVBQUUsVUFBa0IsRUFBRSxVQUFrQjtRQUVyRixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUMvQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUU3RixNQUFNLGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsRUFBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLFFBQVEsRUFBQyxDQUFDLENBQUM7UUFDOUYsSUFBSSxjQUFjLEVBQUU7WUFDaEIsT0FBTyxjQUFjLENBQUM7U0FDekI7UUFFRCxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUM7WUFDbEMsV0FBVyxFQUFFLE1BQU07WUFDbkIsUUFBUSxFQUFFLFVBQVUsQ0FBQyxRQUFRO1lBQzdCLFVBQVUsRUFBRSxVQUFVLENBQUMsVUFBVTtZQUNqQyxVQUFVLEVBQUUsVUFBVSxDQUFDLFVBQVU7WUFDakMsa0JBQWtCLEVBQUUsVUFBVSxDQUFDLGtCQUFrQjtTQUNwRCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFpQjtRQUN6QixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsU0FBaUIsRUFBRSxJQUFZLEVBQUUsUUFBZ0IsRUFBRSxVQUFvQixFQUFFLE9BQWdCO1FBQ3hHLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNsQixNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDOUMsSUFBSSxTQUFTLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsUUFBUSxFQUFFO1lBQ25DLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUNuSDtRQUNELE9BQU8sRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFpQixFQUFFLEdBQUcsSUFBSTtRQUNwQyxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBaUIsRUFBRSxHQUFHLElBQUk7UUFDakMsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQW1CLEVBQUUsR0FBRyxJQUFJO1FBQ3hDLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUFDLFFBQVEsRUFBRSxFQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUMsRUFBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDL0UsQ0FBQztJQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsVUFBc0IsRUFBRSxVQUFrQjtRQUN6RCxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUM7WUFDckMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxRQUFRO1NBQ2hDLEVBQUUsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNwRCxDQUFDO0NBQ0osQ0FBQTtBQTlERztJQURDLGVBQU0sRUFBRTs7MENBQ0w7QUFFSjtJQURDLGVBQU0sRUFBRTs7cURBQ3VCO0FBRWhDO0lBREMsZUFBTSxFQUFFOzt5REFDVTtBQVBWLGFBQWE7SUFEekIsZ0JBQU8sQ0FBQyxlQUFlLENBQUM7R0FDWixhQUFhLENBaUV6QjtBQWpFWSxzQ0FBYSJ9