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
const dist_1 = require("@freelog/resource-policy-lang/dist");
let PolicyService = class PolicyService {
    ctx;
    policyCompiler;
    policyInfoProvider;
    policyTranslate(policies) {
        const list = [];
        for (let policyInfo of policies) {
            policyInfo = Reflect.has(policyInfo, 'toObject') ? policyInfo['toObject']() : policyInfo;
            const contractEntity = {
                audiences: policyInfo.fsmDeclarationInfo?.audiences ?? [],
                fsmStates: []
            };
            for (const [stateName, stateInfo] of Object.entries(policyInfo.fsmDescriptionInfo)) {
                const fsmState = {
                    name: stateName,
                    serviceStates: stateInfo.serviceStates,
                    events: stateInfo.transitions.map(eventInfo => {
                        return {
                            id: eventInfo.eventId,
                            name: eventInfo.name,
                            args: eventInfo.args,
                            state: eventInfo.toState
                        };
                    })
                };
                contractEntity.fsmStates.push(fsmState);
            }
            policyInfo.translateInfo = (0, dist_1.report)(contractEntity);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9saWN5LXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL3NlcnZpY2UvcG9saWN5LXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQXVDO0FBTXZDLDZEQUEwRDtBQUcxRCxJQUFhLGFBQWEsR0FBMUIsTUFBYSxhQUFhO0lBR3RCLEdBQUcsQ0FBaUI7SUFFcEIsY0FBYyxDQUFrQjtJQUVoQyxrQkFBa0IsQ0FBZ0M7SUFFbEQsZUFBZSxDQUFDLFFBQXNCO1FBQ2xDLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNoQixLQUFLLElBQUksVUFBVSxJQUFJLFFBQVEsRUFBRTtZQUM3QixVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7WUFDekYsTUFBTSxjQUFjLEdBQW1CO2dCQUNuQyxTQUFTLEVBQUUsVUFBVSxDQUFDLGtCQUFrQixFQUFFLFNBQVMsSUFBSSxFQUFFO2dCQUN6RCxTQUFTLEVBQUUsRUFBRTthQUNoQixDQUFDO1lBQ0YsS0FBSyxNQUFNLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLEVBQUU7Z0JBQ2hGLE1BQU0sUUFBUSxHQUFjO29CQUN4QixJQUFJLEVBQUUsU0FBUztvQkFDZixhQUFhLEVBQUUsU0FBUyxDQUFDLGFBQWE7b0JBQ3RDLE1BQU0sRUFBRSxTQUFTLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTt3QkFDMUMsT0FBTzs0QkFDSCxFQUFFLEVBQUUsU0FBUyxDQUFDLE9BQU87NEJBQ3JCLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSTs0QkFDcEIsSUFBSSxFQUFFLFNB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