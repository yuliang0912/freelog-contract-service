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
const lodash_1 = require("lodash");
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
        const fsmDescriptionInfo = state_machine.states;
        const serviceStateMap = new Map(state_machine.declarations.serviceStates.map(x => [x.name, x.type.toLowerCase()]));
        for (const fsmStateDescriptionInfo of Object.values(fsmDescriptionInfo)) {
            fsmStateDescriptionInfo.isAuth = fsmStateDescriptionInfo.serviceStates.some(x => serviceStateMap.get(x) === egg_freelog_base_1.ContractColorStateTypeEnum[egg_freelog_base_1.ContractColorStateTypeEnum.Authorization].toLowerCase());
            fsmStateDescriptionInfo.isTestAuth = fsmStateDescriptionInfo.serviceStates.some(x => serviceStateMap.get(x) === egg_freelog_base_1.ContractColorStateTypeEnum[egg_freelog_base_1.ContractColorStateTypeEnum.TestAuthorization].toLowerCase());
            if (lodash_1.isEmpty(fsmStateDescriptionInfo.transitions)) {
                fsmStateDescriptionInfo.isTerminate = true;
                continue;
            }
            for (const eventInfo of fsmStateDescriptionInfo.transitions) {
                eventInfo.eventId = uuid_1.v4().replace(/-/g, '');
                Reflect.deleteProperty(eventInfo, 'description');
            }
        }
        let fsmDeclarationInfo = Object.assign({}, state_machine.declarations || {}, state_machine.description || {});
        fsmDeclarationInfo.audiences = state_machine.audiences || [];
        return {
            policyId: this.generatePolicyId(subjectType, policyText),
            subjectType, policyText, fsmDeclarationInfo, fsmDescriptionInfo
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXh0ZW5kL3BvbGljeS1jb21waWxlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSwrQkFBd0I7QUFDeEIsbUNBQThDO0FBQzlDLHdFQUFzRDtBQUV0RCx1REFBMkY7QUFDM0YsbUNBQStCO0FBSS9CLElBQWEsY0FBYyxHQUEzQixNQUFhLGNBQWM7SUFPdkI7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBNEIsRUFBRSxVQUFrQjtRQUUzRCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ2hDLElBQUksSUFBSSxDQUFDLEdBQUcsS0FBSyxPQUFPLEVBQUU7WUFDdEIsU0FBUyxHQUFHLDRCQUE0QixDQUFDO1NBQzVDO1FBQ0QsTUFBTSxFQUFDLGFBQWEsRUFBQyxHQUFHLE1BQU0sOEJBQU8sQ0FBQyxVQUFVLEVBQUUsa0NBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0SCxNQUFNLGtCQUFrQixHQUF1QixhQUFhLENBQUMsTUFBTSxDQUFDO1FBQ3BFLE1BQU0sZUFBZSxHQUFHLElBQUksR0FBRyxDQUFFLGFBQWEsQ0FBQyxZQUFZLENBQUMsYUFBdUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU5SCxLQUFLLE1BQU0sdUJBQXVCLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO1lBQ3JFLHVCQUF1QixDQUFDLE1BQU0sR0FBRyx1QkFBdUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyw2Q0FBMEIsQ0FBQyw2Q0FBMEIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBQ2hNLHVCQUF1QixDQUFDLFVBQVUsR0FBRyx1QkFBdUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyw2Q0FBMEIsQ0FBQyw2Q0FBMEIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDeE0sSUFBSSxnQkFBTyxDQUFDLHVCQUF1QixDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUM5Qyx1QkFBdUIsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO2dCQUMzQyxTQUFTO2FBQ1o7WUFDRCxLQUFLLE1BQU0sU0FBUyxJQUFJLHVCQUF1QixDQUFDLFdBQVcsRUFBRTtnQkFDekQsU0FBUyxDQUFDLE9BQU8sR0FBRyxTQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUMzQyxPQUFPLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQzthQUNwRDtTQUNKO1FBRUQsSUFBSSxrQkFBa0IsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxhQUFhLENBQUMsWUFBWSxJQUFJLEVBQUUsRUFBRSxhQUFhLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzlHLGtCQUFrQixDQUFDLFNBQVMsR0FBRyxhQUFhLENBQUMsU0FBUyxJQUFJLEVBQUUsQ0FBQztRQUM3RCxPQUFPO1lBQ0gsUUFBUSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDO1lBQ3hELFdBQVcsRUFBRSxVQUFVLEVBQUUsa0JBQWtCLEVBQUUsa0JBQWtCO1NBQ2xFLENBQUM7SUFDTixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGdCQUFnQixDQUFDLFdBQTRCLEVBQUUsVUFBa0I7UUFDN0QsT0FBTywrQkFBWSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsVUFBVSxDQUFDLElBQUksRUFBRSxpQkFBaUIsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUNwRyxDQUFDO0NBQ0osQ0FBQTtBQWhERztJQURDLGVBQU0sRUFBRTs7a0RBQ1U7QUFFbkI7SUFEQyxlQUFNLEVBQUU7OzJDQUNHO0FBTEgsY0FBYztJQUYxQixnQkFBTyxFQUFFO0lBQ1QsY0FBSyxDQUFDLFdBQVcsQ0FBQztHQUNOLGNBQWMsQ0FtRDFCO0FBbkRZLHdDQUFjIn0=