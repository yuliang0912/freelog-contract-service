"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePolicyCompiler = void 0;
const crypto_helper_1 = require("egg-freelog-base/app/extend/helper/crypto_helper");
const egg_freelog_base_1 = require("egg-freelog-base");
const uuid_1 = require("uuid");
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
        return crypto_helper_1.md5(`$FREELOG_POLICY_TEXT_${policyText.trim()}_SUBJECT_TYPE_${subjectType}`);
        // return md5(policyText.replace(/\s{2,}/g, '') + '_subjectType:' + subjectType);
    }
    /**
     * 生成事件ID
     * @param fsmDescriptionInfo
     */
    setFsmDescriptionInfoProperty(fsmDescriptionInfo) {
        for (const [_, fsmStateDescriptionInfo] of Object.entries(fsmDescriptionInfo)) {
            for (const [_, policyEventInfo] of Object.entries(fsmStateDescriptionInfo.transition)) {
                if (policyEventInfo) {
                    policyEventInfo.eventId = uuid_1.v4().replace(/-/g, '');
                }
            }
        }
        return fsmDescriptionInfo;
    }
}
exports.BasePolicyCompiler = BasePolicyCompiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZVBvbGljeUNvbXBpbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2V4dGVuZC9wb2xpY3ktY29tcGlsZXIvYmFzZVBvbGljeUNvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLG9GQUFxRTtBQUVyRSx1REFBa0Q7QUFDbEQsK0JBQXdCO0FBRXhCLE1BQWEsa0JBQWtCO0lBRTNCLFFBQVEsQ0FBQyxXQUF3QixFQUFFLFVBQWtCO1FBQ2pELE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxLQUFLO1FBQ3JCLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyx5QkFBeUIsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsZ0JBQWdCLENBQUMsV0FBd0IsRUFBRSxVQUFrQjtRQUN6RCxPQUFPLG1CQUFHLENBQUMsd0JBQXdCLFVBQVUsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDcEYsaUZBQWlGO0lBQ3JGLENBQUM7SUFFRDs7O09BR0c7SUFDSCw2QkFBNkIsQ0FBQyxrQkFBc0M7UUFFaEUsS0FBSyxNQUFNLENBQUMsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO1lBQzNFLEtBQUssTUFBTSxDQUFDLENBQUMsRUFBRSxlQUFlLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUNuRixJQUFJLGVBQWUsRUFBRTtvQkFDakIsZUFBZSxDQUFDLE9BQU8sR0FBRyxTQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2lCQUNwRDthQUNKO1NBQ0o7UUFDRCxPQUFPLGtCQUFrQixDQUFDO0lBQzlCLENBQUM7Q0FDSjtBQWxDRCxnREFrQ0MifQ==