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
const resource_policy_lang_1 = require("@freelog/resource-policy-lang");
let PolicyService = class PolicyService {
    ctx;
    policyCompiler;
    policyInfoProvider;
    policyTranslate(policies) {
        const list = [];
        for (let policyInfo of policies) {
            policyInfo = Reflect.has(policyInfo, 'toObject') ? policyInfo['toObject']() : policyInfo;
            console.log(JSON.stringify({
                audiences: policyInfo.fsmDeclarationInfo?.audiences ?? [],
                declarations: policyInfo.fsmDeclarationInfo,
                description: policyInfo.fsmDeclarationInfo,
                states: policyInfo.fsmDescriptionInfo
            }));
            policyInfo.translateInfo = (0, resource_policy_lang_1.report)({
                audiences: policyInfo.fsmDeclarationInfo?.audiences ?? [],
                declarations: policyInfo.fsmDeclarationInfo,
                description: policyInfo.fsmDeclarationInfo,
                states: policyInfo.fsmDescriptionInfo
            });
            list.push(policyInfo);
        }
        return list;
    }
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
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], PolicyService.prototype, "ctx", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], PolicyService.prototype, "policyCompiler", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], PolicyService.prototype, "policyInfoProvider", void 0);
PolicyService = __decorate([
    (0, midway_1.provide)('policyService')
], PolicyService);
exports.PolicyService = PolicyService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9saWN5LXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL3NlcnZpY2UvcG9saWN5LXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQXVDO0FBSXZDLHdFQUFxRDtBQUdyRCxJQUFhLGFBQWEsR0FBMUIsTUFBYSxhQUFhO0lBR3RCLEdBQUcsQ0FBaUI7SUFFcEIsY0FBYyxDQUFrQjtJQUVoQyxrQkFBa0IsQ0FBZ0M7SUFFbEQsZUFBZSxDQUFDLFFBQXNCO1FBQ2xDLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNoQixLQUFLLElBQUksVUFBVSxJQUFJLFFBQVEsRUFBRTtZQUM3QixVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7WUFDekYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUN2QixTQUFTLEVBQUUsVUFBVSxDQUFDLGtCQUFrQixFQUFFLFNBQVMsSUFBSSxFQUFFO2dCQUN6RCxZQUFZLEVBQUUsVUFBVSxDQUFDLGtCQUFrQjtnQkFDM0MsV0FBVyxFQUFFLFVBQVUsQ0FBQyxrQkFBa0I7Z0JBQzFDLE1BQU0sRUFBRSxVQUFVLENBQUMsa0JBQWtCO2FBQ3hDLENBQUMsQ0FBQyxDQUFDO1lBQ0osVUFBVSxDQUFDLGFBQWEsR0FBRyxJQUFBLDZCQUFNLEVBQUM7Z0JBQzlCLFNBQVMsRUFBRSxVQUFVLENBQUMsa0JBQWtCLEVBQUUsU0FBUyxJQUFJLEVBQUU7Z0JBQ3pELFlBQVksRUFBRSxVQUFVLENBQUMsa0JBQWtCO2dCQUMzQyxXQUFXLEVBQUUsVUFBVSxDQUFDLGtCQUFrQjtnQkFDMUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxrQkFBa0I7YUFDeEMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUN6QjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFdBQTRCLEVBQUUsVUFBa0I7UUFFckUsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDL0UsTUFBTSxjQUFjLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLEVBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDO1FBQzlGLElBQUksY0FBYyxFQUFFO1lBQ2hCLE9BQU8sY0FBYyxDQUFDO1NBQ3pCO1FBRUQsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDO1lBQ2xDLFdBQVc7WUFDWCxRQUFRLEVBQUUsVUFBVSxDQUFDLFFBQVE7WUFDN0IsVUFBVSxFQUFFLFVBQVUsQ0FBQyxVQUFVO1lBQ2pDLGtCQUFrQixFQUFFLFVBQVUsQ0FBQyxrQkFBa0I7U0FDcEQsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsb0JBQW9CLENBQUMsV0FBNEIsRUFBRSxXQUFxQjtRQUUxRSxNQUFNLFVBQVUsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUMsVUFBVSxFQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pJLE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEQsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBQyxRQUFRLEVBQUUsRUFBQyxHQUFHLEVBQUUsU0FBUyxFQUFDLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNoRixPQUFPLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxpQkFBaUIsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDckYsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDNUQsT0FBTyxVQUFVLENBQUM7SUFDdEIsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBaUI7UUFDekIsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQWlCLEVBQUUsR0FBRyxJQUFJO1FBQ3BDLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFpQixFQUFFLEdBQUcsSUFBSTtRQUNqQyxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBbUIsRUFBRSxHQUFHLElBQUk7UUFDeEMsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEVBQUMsUUFBUSxFQUFFLEVBQUMsR0FBRyxFQUFFLFNBQVMsRUFBQyxFQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUMvRSxDQUFDO0NBQ0osQ0FBQTtBQWhGRztJQURDLElBQUEsZUFBTSxHQUFFOzswQ0FDVztBQUVwQjtJQURDLElBQUEsZUFBTSxHQUFFOztxREFDdUI7QUFFaEM7SUFEQyxJQUFBLGVBQU0sR0FBRTs7eURBQ3lDO0FBUHpDLGFBQWE7SUFEekIsSUFBQSxnQkFBTyxFQUFDLGVBQWUsQ0FBQztHQUNaLGFBQWEsQ0FtRnpCO0FBbkZZLHNDQUFhIn0=