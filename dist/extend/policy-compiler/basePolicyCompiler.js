"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePolicyCompiler = void 0;
const crypto_helper_1 = require("egg-freelog-base/app/extend/helper/crypto_helper");
const enum_1 = require("../../enum");
const egg_freelog_base_1 = require("egg-freelog-base");
class BasePolicyCompiler {
    compiler(subjectType, policyText) {
        throw new egg_freelog_base_1.ApplicationError('compiler not implemented');
    }
    compilerErrorHandle(error) {
        throw new egg_freelog_base_1.ApplicationError(`policy compiler error:${error}`);
    }
    /**
     * 生成策略Id
     * @param policyText
     */
    generatePolicyId(subjectType, policyText) {
        return crypto_helper_1.md5(`$FREELOG_POLICY_TEXT_${policyText.trim()}_SUBJECT_TYPE_${enum_1.SubjectType}`);
        // return md5(policyText.replace(/\s{2,}/g, '') + '_subjectType:' + subjectType);
    }
}
exports.BasePolicyCompiler = BasePolicyCompiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZVBvbGljeUNvbXBpbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2V4dGVuZC9wb2xpY3ktY29tcGlsZXIvYmFzZVBvbGljeUNvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLG9GQUFxRTtBQUNyRSxxQ0FBdUM7QUFDdkMsdURBQWtEO0FBRWxELE1BQWEsa0JBQWtCO0lBRTNCLFFBQVEsQ0FBQyxXQUF3QixFQUFFLFVBQWtCO1FBQ2pELE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxLQUFLO1FBQ3JCLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyx5QkFBeUIsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsZ0JBQWdCLENBQUMsV0FBd0IsRUFBRSxVQUFrQjtRQUN6RCxPQUFPLG1CQUFHLENBQUMsd0JBQXdCLFVBQVUsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLGtCQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQ3BGLGlGQUFpRjtJQUNyRixDQUFDO0NBQ0o7QUFsQkQsZ0RBa0JDIn0=