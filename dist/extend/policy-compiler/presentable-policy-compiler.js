"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresentablePolicyCompiler = void 0;
const basePolicyCompiler_1 = require("./basePolicyCompiler");
const freelogPolicyCompiler = require('@freelog/resource-policy-lang');
class PresentablePolicyCompiler extends basePolicyCompiler_1.BasePolicyCompiler {
    compiler(subjectType, policyText) {
        const { state_machine, errors } = freelogPolicyCompiler.compile(policyText);
        if (errors.length) {
            super.compilerErrorHandle(errors.map(x => x.toString()).join(','));
        }
        return {
            policyId: super.generatePolicyId(subjectType, policyText),
            policyText, subjectType,
            fsmDescriptionInfo: state_machine.states
        };
    }
}
exports.PresentablePolicyCompiler = PresentablePolicyCompiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2VudGFibGUtcG9saWN5LWNvbXBpbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2V4dGVuZC9wb2xpY3ktY29tcGlsZXIvcHJlc2VudGFibGUtcG9saWN5LWNvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZEQUF3RDtBQUl4RCxNQUFNLHFCQUFxQixHQUFHLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBRXZFLE1BQWEseUJBQTBCLFNBQVEsdUNBQWtCO0lBRTdELFFBQVEsQ0FBQyxXQUF3QixFQUFFLFVBQWtCO1FBRWpELE1BQU0sRUFBQyxhQUFhLEVBQUUsTUFBTSxFQUFDLEdBQUcscUJBQXFCLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzFFLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUNmLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDdEU7UUFDRCxPQUFPO1lBQ0gsUUFBUSxFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDO1lBQ3pELFVBQVUsRUFBRSxXQUFXO1lBQ3ZCLGtCQUFrQixFQUFFLGFBQWEsQ0FBQyxNQUFNO1NBQzNDLENBQUM7SUFDTixDQUFDO0NBQ0o7QUFkRCw4REFjQyJ9