"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresentablePolicyCompiler = void 0;
const basePolicyCompiler_1 = require("./basePolicyCompiler");
const freelogPolicyCompiler = require('@freelog/resource-policy-lang');
// 展品策略编译
class PresentablePolicyCompiler extends basePolicyCompiler_1.BasePolicyCompiler {
    compiler(subjectType, policyText) {
        const { state_machine, errors } = freelogPolicyCompiler.compile(policyText);
        if (errors.length) {
            super.compilerErrorHandle(errors.map(x => x.toString()).join(','));
        }
        return {
            policyId: super.generatePolicyId(subjectType, policyText),
            policyText, subjectType,
            fsmDescriptionInfo: super.setFsmDescriptionInfoProperty(state_machine.states)
        };
    }
}
exports.PresentablePolicyCompiler = PresentablePolicyCompiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2VudGFibGUtcG9saWN5LWNvbXBpbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2V4dGVuZC9wb2xpY3ktY29tcGlsZXIvcHJlc2VudGFibGUtcG9saWN5LWNvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZEQUF3RDtBQUl4RCxNQUFNLHFCQUFxQixHQUFHLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBRXZFLFNBQVM7QUFDVCxNQUFhLHlCQUEwQixTQUFRLHVDQUFrQjtJQUU3RCxRQUFRLENBQUMsV0FBd0IsRUFBRSxVQUFrQjtRQUVqRCxNQUFNLEVBQUMsYUFBYSxFQUFFLE1BQU0sRUFBQyxHQUFHLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMxRSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDZixLQUFLLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ3RFO1FBQ0QsT0FBTztZQUNILFFBQVEsRUFBRSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQztZQUN6RCxVQUFVLEVBQUUsV0FBVztZQUN2QixrQkFBa0IsRUFBRSxLQUFLLENBQUMsNkJBQTZCLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQztTQUNoRixDQUFDO0lBQ04sQ0FBQztDQUNKO0FBZEQsOERBY0MifQ==