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
exports.PolicyCompiler = void 0;
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
const uuid_1 = require("uuid");
const lodash_1 = require("lodash");
const resource_policy_lang_1 = require("@freelog/resource-policy-lang");
let PolicyCompiler = class PolicyCompiler {
    /**
     * 根据标的物类型编译策略文本
     * @param subjectType
     * @param policyText
     */
    async compiler(subjectType, policyText) {
        const { state_machine } = await resource_policy_lang_1.compile(policyText, egg_freelog_base_1.SubjectTypeEnum[subjectType].toLocaleLowerCase(), this.gatewayUrl, '');
        const serviceStateMap = new Map(state_machine.declarations.serviceStates.map(x => [x.name, lodash_1.capitalize(x.type)]));
        for (const [_, fsmStateDescriptionInfo] of Object.entries(state_machine.states)) {
            fsmStateDescriptionInfo['isAuth'] = fsmStateDescriptionInfo['serviceStates'].some(x => serviceStateMap.get(x) === egg_freelog_base_1.ContractColorStateTypeEnum[egg_freelog_base_1.ContractColorStateTypeEnum.Authorization]);
            fsmStateDescriptionInfo['isTestAuth'] = fsmStateDescriptionInfo['serviceStates'].some(x => serviceStateMap.get(x) === egg_freelog_base_1.ContractColorStateTypeEnum[egg_freelog_base_1.ContractColorStateTypeEnum.TestAuthorization]);
            if (!fsmStateDescriptionInfo['transition']) {
                fsmStateDescriptionInfo['isTerminate'] = true;
                continue;
            }
            for (const [_, policyEventInfo] of Object.entries(fsmStateDescriptionInfo['transition'])) {
                if (policyEventInfo && policyEventInfo['event']) {
                    policyEventInfo['event']['eventId'] = uuid_1.v4().replace(/-/g, '');
                }
            }
        }
        return {
            policyId: this.generatePolicyId(subjectType, policyText),
            subjectType, policyText,
            fsmDeclarationInfo: state_machine.declarations,
            fsmDescriptionInfo: state_machine.states,
        };
    }
    /**
     * 生成策略ID
     * @param subjectType
     * @param policyText
     */
    generatePolicyId(subjectType, policyText) {
        return egg_freelog_base_1.CryptoHelper.md5(`$FREELOG_POLICY_TEXT_${policyText.trim()}_SUBJECT_TYPE_${subjectType}`);
    }
};
__decorate([
    midway_1.config(),
    __metadata("design:type", String)
], PolicyCompiler.prototype, "gatewayUrl", void 0);
PolicyCompiler = __decorate([
    midway_1.provide(),
    midway_1.scope('Singleton')
], PolicyCompiler);
exports.PolicyCompiler = PolicyCompiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXh0ZW5kL3BvbGljeS1jb21waWxlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBOEM7QUFFOUMsdURBQTJGO0FBQzNGLCtCQUF3QjtBQUN4QixtQ0FBa0M7QUFDbEMsd0VBQXNEO0FBS3RELElBQWEsY0FBYyxHQUEzQixNQUFhLGNBQWM7SUFLdkI7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBNEIsRUFBRSxVQUFrQjtRQUMzRCxNQUFNLEVBQUMsYUFBYSxFQUFDLEdBQUcsTUFBTSw4QkFBTyxDQUFDLFVBQVUsRUFBRSxrQ0FBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDLGlCQUFpQixFQUFFLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN6SCxNQUFNLGVBQWUsR0FBRyxJQUFJLEdBQUcsQ0FBRSxhQUFhLENBQUMsWUFBWSxDQUFDLGFBQXVCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLG1CQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVILEtBQUssTUFBTSxDQUFDLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzdFLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxHQUFHLHVCQUF1QixDQUFDLGVBQWUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssNkNBQTBCLENBQUMsNkNBQTBCLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUN4TCx1QkFBdUIsQ0FBQyxZQUFZLENBQUMsR0FBRyx1QkFBdUIsQ0FBQyxlQUFlLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLDZDQUEwQixDQUFDLDZDQUEwQixDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztZQUNoTSxJQUFJLENBQUMsdUJBQXVCLENBQUMsWUFBWSxDQUFDLEVBQUU7Z0JBQ3hDLHVCQUF1QixDQUFDLGFBQWEsQ0FBQyxHQUFHLElBQUksQ0FBQztnQkFDOUMsU0FBUzthQUNaO1lBQ0QsS0FBSyxNQUFNLENBQUMsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsdUJBQXVCLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRTtnQkFDdEYsSUFBSSxlQUFlLElBQUksZUFBZSxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUM3QyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBRSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztpQkFDaEU7YUFDSjtTQUNKO1FBRUQsT0FBTztZQUNILFFBQVEsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQztZQUN4RCxXQUFXLEVBQUUsVUFBVTtZQUN2QixrQkFBa0IsRUFBRSxhQUFhLENBQUMsWUFBWTtZQUM5QyxrQkFBa0IsRUFBRSxhQUFhLENBQUMsTUFBTTtTQUMzQyxDQUFDO0lBQ04sQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxnQkFBZ0IsQ0FBQyxXQUE0QixFQUFFLFVBQWtCO1FBQzdELE9BQU8sK0JBQVksQ0FBQyxHQUFHLENBQUMsd0JBQXdCLFVBQVUsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDckcsQ0FBQztDQUNKLENBQUE7QUF4Q0c7SUFEQyxlQUFNLEVBQUU7O2tEQUNVO0FBSFYsY0FBYztJQUYxQixnQkFBTyxFQUFFO0lBQ1QsY0FBSyxDQUFDLFdBQVcsQ0FBQztHQUNOLGNBQWMsQ0EyQzFCO0FBM0NZLHdDQUFjIn0=