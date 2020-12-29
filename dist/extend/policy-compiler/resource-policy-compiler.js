"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourcePolicyCompiler = void 0;
const basePolicyCompiler_1 = require("./basePolicyCompiler");
const freelogPolicyCompiler = require('@freelog/resource-policy-lang');
// 资源策略编译
class ResourcePolicyCompiler extends basePolicyCompiler_1.BasePolicyCompiler {
    compiler(subjectType, policyText) {
        const { state_machine, errors } = freelogPolicyCompiler.compile(policyText);
        if (errors.length) {
            super.compilerErrorHandle(errors.map(x => x.toString()).join(','));
        }
        return {
            policyId: super.generatePolicyId(subjectType, policyText), policyText, subjectType,
            fsmDescriptionInfo: super.setFsmDescriptionInfoProperty(state_machine.states)
        };
    }
}
exports.ResourcePolicyCompiler = ResourcePolicyCompiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtcG9saWN5LWNvbXBpbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2V4dGVuZC9wb2xpY3ktY29tcGlsZXIvcmVzb3VyY2UtcG9saWN5LWNvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZEQUF3RDtBQUl4RCxNQUFNLHFCQUFxQixHQUFHLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBRXZFLFNBQVM7QUFDVCxNQUFhLHNCQUF1QixTQUFRLHVDQUFrQjtJQUUxRCxRQUFRLENBQUMsV0FBNEIsRUFBRSxVQUFrQjtRQUVyRCxNQUFNLEVBQUMsYUFBYSxFQUFFLE1BQU0sRUFBQyxHQUFHLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMxRSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDZixLQUFLLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ3RFO1FBRUQsT0FBTztZQUNILFFBQVEsRUFBRSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxXQUFXO1lBQ2xGLGtCQUFrQixFQUFFLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDO1NBQ2hGLENBQUM7SUFDTixDQUFDO0NBQ0o7QUFkRCx3REFjQyJ9