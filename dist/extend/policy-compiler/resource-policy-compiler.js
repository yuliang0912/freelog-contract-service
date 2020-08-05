"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourcePolicyCompiler = void 0;
const basePolicyCompiler_1 = require("./basePolicyCompiler");
const freelogPolicyCompiler = require('@freelog/resource-policy-lang');
class ResourcePolicyCompiler extends basePolicyCompiler_1.BasePolicyCompiler {
    compiler(userId, subjectType, policyText, policyName) {
        const { state_machine, errors } = freelogPolicyCompiler.compile(policyText);
        if (errors.length) {
            super.compilerErrorHandle(errors.map(x => x.toString()).join(','));
        }
        return {
            policyId: super.generatePolicyId(userId, subjectType, policyText),
            policyText, policyName, subjectType,
            fsmDescriptionInfo: state_machine.states
        };
    }
}
exports.ResourcePolicyCompiler = ResourcePolicyCompiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtcG9saWN5LWNvbXBpbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2V4dGVuZC9wb2xpY3ktY29tcGlsZXIvcmVzb3VyY2UtcG9saWN5LWNvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZEQUF3RDtBQUl4RCxNQUFNLHFCQUFxQixHQUFHLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBRXZFLE1BQWEsc0JBQXVCLFNBQVEsdUNBQWtCO0lBRTFELFFBQVEsQ0FBQyxNQUFjLEVBQUUsV0FBd0IsRUFBRSxVQUFrQixFQUFFLFVBQWtCO1FBRXJGLE1BQU0sRUFBQyxhQUFhLEVBQUUsTUFBTSxFQUFDLEdBQUcscUJBQXFCLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzFFLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUNmLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDdEU7UUFFRCxPQUFPO1lBQ0gsUUFBUSxFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLFVBQVUsQ0FBQztZQUNqRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFdBQVc7WUFDbkMsa0JBQWtCLEVBQUUsYUFBYSxDQUFDLE1BQU07U0FDM0MsQ0FBQztJQUNOLENBQUM7Q0FDSjtBQWZELHdEQWVDIn0=