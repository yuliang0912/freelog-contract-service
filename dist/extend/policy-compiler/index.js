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
        const serviceStateMap = new Map(state_machine.declarations.serviceStates.map(x => [x.name, x.type.toLowerCase()]));
        for (const [_, fsmStateDescriptionInfo] of Object.entries(state_machine.states)) {
            fsmStateDescriptionInfo['isAuth'] = fsmStateDescriptionInfo['serviceStates'].some(x => serviceStateMap.get(x) === egg_freelog_base_1.ContractColorStateTypeEnum[egg_freelog_base_1.ContractColorStateTypeEnum.Authorization].toLowerCase());
            fsmStateDescriptionInfo['isTestAuth'] = fsmStateDescriptionInfo['serviceStates'].some(x => serviceStateMap.get(x) === egg_freelog_base_1.ContractColorStateTypeEnum[egg_freelog_base_1.ContractColorStateTypeEnum.TestAuthorization].toLowerCase());
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
        let fsmDeclarationInfo = Object.assign({}, state_machine.declarations || {}, state_machine.description || {});
        fsmDeclarationInfo.audiences = state_machine.audiences || [];
        return {
            policyId: this.generatePolicyId(subjectType, policyText),
            subjectType, policyText, fsmDeclarationInfo,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXh0ZW5kL3BvbGljeS1jb21waWxlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSwrQkFBd0I7QUFDeEIsbUNBQThDO0FBQzlDLHdFQUFzRDtBQUV0RCx1REFBMkY7QUFJM0YsSUFBYSxjQUFjLEdBQTNCLE1BQWEsY0FBYztJQU92Qjs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUE0QixFQUFFLFVBQWtCO1FBRTNELElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDaEMsSUFBSSxJQUFJLENBQUMsR0FBRyxLQUFLLE9BQU8sRUFBRTtZQUN0QixTQUFTLEdBQUcsNEJBQTRCLENBQUM7U0FDNUM7UUFDRCxNQUFNLEVBQUMsYUFBYSxFQUFDLEdBQUcsTUFBTSw4QkFBTyxDQUFDLFVBQVUsRUFBRSxrQ0FBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDLGlCQUFpQixFQUFFLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3RILE1BQU0sZUFBZSxHQUFHLElBQUksR0FBRyxDQUFFLGFBQWEsQ0FBQyxZQUFZLENBQUMsYUFBdUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU5SCxLQUFLLE1BQU0sQ0FBQyxDQUFDLEVBQUUsdUJBQXVCLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUM3RSx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsR0FBRyx1QkFBdUIsQ0FBQyxlQUFlLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLDZDQUEwQixDQUFDLDZDQUEwQixDQUFDLGFBQWEsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDdE0sdUJBQXVCLENBQUMsWUFBWSxDQUFDLEdBQUcsdUJBQXVCLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyw2Q0FBMEIsQ0FBQyw2Q0FBMEIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDOU0sSUFBSSxDQUFDLHVCQUF1QixDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUN4Qyx1QkFBdUIsQ0FBQyxhQUFhLENBQUMsR0FBRyxJQUFJLENBQUM7Z0JBQzlDLFNBQVM7YUFDWjtZQUNELEtBQUssTUFBTSxDQUFDLENBQUMsRUFBRSxlQUFlLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLHVCQUF1QixDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUU7Z0JBQ3RGLGVBQWUsQ0FBQyxTQUFTLENBQUMsR0FBRyxTQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNwRCxPQUFPLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDdEMsT0FBTyxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDdkM7U0FDSjtRQUVELElBQUksa0JBQWtCLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsYUFBYSxDQUFDLFlBQVksSUFBSSxFQUFFLEVBQUUsYUFBYSxDQUFDLFdBQVcsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUM5RyxrQkFBa0IsQ0FBQyxTQUFTLEdBQUcsYUFBYSxDQUFDLFNBQVMsSUFBSSxFQUFFLENBQUM7UUFDN0QsT0FBTztZQUNILFFBQVEsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQztZQUN4RCxXQUFXLEVBQUUsVUFBVSxFQUFFLGtCQUFrQjtZQUMzQyxrQkFBa0IsRUFBRSxhQUFhLENBQUMsTUFBTTtTQUMzQyxDQUFDO0lBQ04sQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxnQkFBZ0IsQ0FBQyxXQUE0QixFQUFFLFVBQWtCO1FBQzdELE9BQU8sK0JBQVksQ0FBQyxHQUFHLENBQUMsdUJBQXVCLFVBQVUsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDcEcsQ0FBQztDQUNKLENBQUE7QUFqREc7SUFEQyxlQUFNLEVBQUU7O2tEQUNVO0FBRW5CO0lBREMsZUFBTSxFQUFFOzsyQ0FDRztBQUxILGNBQWM7SUFGMUIsZ0JBQU8sRUFBRTtJQUNULGNBQUssQ0FBQyxXQUFXLENBQUM7R0FDTixjQUFjLENBb0QxQjtBQXBEWSx3Q0FBYyJ9