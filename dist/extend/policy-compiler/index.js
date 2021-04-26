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
const uuid_1 = require("uuid");
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const resource_policy_lang_1 = require("@freelog/resource-policy-lang");
const egg_freelog_base_1 = require("egg-freelog-base");
let PolicyCompiler = class PolicyCompiler {
    /**
     * 根据标的物类型编译策略文本
     * @param subjectType
     * @param policyText
     */
    async compiler(subjectType, policyText) {
        let targetUrl = this.gatewayUrl;
        if (this.env === 'local') {
            targetUrl = 'http://api.testfreelog.com';
        }
        const { state_machine } = await resource_policy_lang_1.compile(policyText, egg_freelog_base_1.SubjectTypeEnum[subjectType].toLocaleLowerCase(), targetUrl, 'dev');
        const serviceStateMap = new Map(state_machine.declarations.serviceStates.map(x => [x.name, lodash_1.capitalize(x.type)]));
        for (const [_, fsmStateDescriptionInfo] of Object.entries(state_machine.states)) {
            fsmStateDescriptionInfo['isAuth'] = fsmStateDescriptionInfo['serviceStates'].some(x => serviceStateMap.get(x) === egg_freelog_base_1.ContractColorStateTypeEnum[egg_freelog_base_1.ContractColorStateTypeEnum.Authorization]);
            fsmStateDescriptionInfo['isTestAuth'] = fsmStateDescriptionInfo['serviceStates'].some(x => serviceStateMap.get(x) === egg_freelog_base_1.ContractColorStateTypeEnum[egg_freelog_base_1.ContractColorStateTypeEnum.TestAuthorization]);
            if (!fsmStateDescriptionInfo['transition']) {
                fsmStateDescriptionInfo['isTerminate'] = true;
                continue;
            }
            for (const [_, policyEventInfo] of Object.entries(fsmStateDescriptionInfo['transition'])) {
                policyEventInfo['eventId'] = uuid_1.v4().replace(/-/g, '');
                delete policyEventInfo['description'];
                delete policyEventInfo['singleton'];
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
        return egg_freelog_base_1.CryptoHelper.md5(`FREELOG_POLICY_TEXT_${policyText.trim()}_SUBJECT_TYPE_${subjectType}`);
    }
};
__decorate([
    midway_1.config(),
    __metadata("design:type", String)
], PolicyCompiler.prototype, "gatewayUrl", void 0);
__decorate([
    midway_1.config(),
    __metadata("design:type", String)
], PolicyCompiler.prototype, "env", void 0);
PolicyCompiler = __decorate([
    midway_1.provide(),
    midway_1.scope('Singleton')
], PolicyCompiler);
exports.PolicyCompiler = PolicyCompiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXh0ZW5kL3BvbGljeS1jb21waWxlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSwrQkFBd0I7QUFDeEIsbUNBQWtDO0FBQ2xDLG1DQUE4QztBQUM5Qyx3RUFBc0Q7QUFFdEQsdURBQTJGO0FBSTNGLElBQWEsY0FBYyxHQUEzQixNQUFhLGNBQWM7SUFPdkI7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBNEIsRUFBRSxVQUFrQjtRQUUzRCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ2hDLElBQUksSUFBSSxDQUFDLEdBQUcsS0FBSyxPQUFPLEVBQUU7WUFDdEIsU0FBUyxHQUFHLDRCQUE0QixDQUFDO1NBQzVDO1FBQ0QsTUFBTSxFQUFDLGFBQWEsRUFBQyxHQUFHLE1BQU0sOEJBQU8sQ0FBQyxVQUFVLEVBQUUsa0NBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0SCxNQUFNLGVBQWUsR0FBRyxJQUFJLEdBQUcsQ0FBRSxhQUFhLENBQUMsWUFBWSxDQUFDLGFBQXVCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLG1CQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVILEtBQUssTUFBTSxDQUFDLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzdFLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxHQUFHLHVCQUF1QixDQUFDLGVBQWUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssNkNBQTBCLENBQUMsNkNBQTBCLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUN4TCx1QkFBdUIsQ0FBQyxZQUFZLENBQUMsR0FBRyx1QkFBdUIsQ0FBQyxlQUFlLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLDZDQUEwQixDQUFDLDZDQUEwQixDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztZQUNoTSxJQUFJLENBQUMsdUJBQXVCLENBQUMsWUFBWSxDQUFDLEVBQUU7Z0JBQ3hDLHVCQUF1QixDQUFDLGFBQWEsQ0FBQyxHQUFHLElBQUksQ0FBQztnQkFDOUMsU0FBUzthQUNaO1lBQ0QsS0FBSyxNQUFNLENBQUMsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsdUJBQXVCLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRTtnQkFDdEYsZUFBZSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFNBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ3BELE9BQU8sZUFBZSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUN0QyxPQUFPLGVBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUN2QztTQUNKO1FBRUQsT0FBTztZQUNILFFBQVEsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQztZQUN4RCxXQUFXLEVBQUUsVUFBVTtZQUN2QixrQkFBa0IsRUFBRSxhQUFhLENBQUMsWUFBWTtZQUM5QyxrQkFBa0IsRUFBRSxhQUFhLENBQUMsTUFBTTtTQUMzQyxDQUFDO0lBQ04sQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxnQkFBZ0IsQ0FBQyxXQUE0QixFQUFFLFVBQWtCO1FBQzdELE9BQU8sK0JBQVksQ0FBQyxHQUFHLENBQUMsdUJBQXVCLFVBQVUsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDcEcsQ0FBQztDQUNKLENBQUE7QUEvQ0c7SUFEQyxlQUFNLEVBQUU7O2tEQUNVO0FBRW5CO0lBREMsZUFBTSxFQUFFOzsyQ0FDRztBQUxILGNBQWM7SUFGMUIsZ0JBQU8sRUFBRTtJQUNULGNBQUssQ0FBQyxXQUFXLENBQUM7R0FDTixjQUFjLENBa0QxQjtBQWxEWSx3Q0FBYyJ9