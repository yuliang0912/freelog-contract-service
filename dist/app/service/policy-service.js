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
    policyTranslate(policies, isSign) {
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
            policyInfo.translateInfo = (0, resource_policy_lang_1.report)(contractEntity, isSign);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9saWN5LXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL3NlcnZpY2UvcG9saWN5LXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQXVDO0FBTXZDLHdFQUFxRDtBQUdyRCxJQUFhLGFBQWEsR0FBMUIsTUFBYSxhQUFhO0lBR3RCLEdBQUcsQ0FBaUI7SUFFcEIsY0FBYyxDQUFrQjtJQUVoQyxrQkFBa0IsQ0FBZ0M7SUFFbEQsZUFBZSxDQUFDLFFBQXNCLEVBQUUsTUFBZ0I7UUFDcEQsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLEtBQUssSUFBSSxVQUFVLElBQUksUUFBUSxFQUFFO1lBQzdCLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztZQUN6RixNQUFNLGNBQWMsR0FBbUI7Z0JBQ25DLFNBQVMsRUFBRSxVQUFVLENBQUMsa0JBQWtCLEVBQUUsU0FBUyxJQUFJLEVBQUU7Z0JBQ3pELFNBQVMsRUFBRSxFQUFFO2FBQ2hCLENBQUM7WUFDRixLQUFLLE1BQU0sQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsRUFBRTtnQkFDaEYsTUFBTSxRQUFRLEdBQWM7b0JBQ3hCLElBQUksRUFBRSxTQUFTO29CQUNmLGFBQWEsRUFBRSxTQUFTLENBQUMsYUFBYTtvQkFDdEMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO3dCQUMxQyxPQUFPOzRCQUNILEVBQUUsRUFBRSxTQUFTLENBQUMsT0FBTzs0QkFDckIsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJOzRCQUNwQixJ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