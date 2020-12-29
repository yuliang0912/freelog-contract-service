"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePolicyCompiler = void 0;
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
        return egg_freelog_base_1.CryptoHelper.md5(`$FREELOG_POLICY_TEXT_${policyText.trim()}_SUBJECT_TYPE_${subjectType}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZVBvbGljeUNvbXBpbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2V4dGVuZC9wb2xpY3ktY29tcGlsZXIvYmFzZVBvbGljeUNvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHVEQUFpRjtBQUNqRiwrQkFBd0I7QUFFeEIsTUFBYSxrQkFBa0I7SUFFM0IsUUFBUSxDQUFDLFdBQTRCLEVBQUUsVUFBa0I7UUFDckQsTUFBTSxJQUFJLG1DQUFnQixDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVELG1CQUFtQixDQUFDLEtBQUs7UUFDckIsTUFBTSxJQUFJLG1DQUFnQixDQUFDLHlCQUF5QixLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFRDs7O09BR0c7SUFDSCxnQkFBZ0IsQ0FBQyxXQUE0QixFQUFFLFVBQWtCO1FBQzdELE9BQU8sK0JBQVksQ0FBQyxHQUFHLENBQUMsd0JBQXdCLFVBQVUsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDakcsaUZBQWlGO0lBQ3JGLENBQUM7SUFFRDs7O09BR0c7SUFDSCw2QkFBNkIsQ0FBQyxrQkFBc0M7UUFFaEUsS0FBSyxNQUFNLENBQUMsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO1lBQzNFLEtBQUssTUFBTSxDQUFDLENBQUMsRUFBRSxlQUFlLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUNuRixJQUFJLGVBQWUsRUFBRTtvQkFDakIsZUFBZSxDQUFDLE9BQU8sR0FBRyxTQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2lCQUNwRDthQUNKO1NBQ0o7UUFDRCxPQUFPLGtCQUFrQixDQUFDO0lBQzlCLENBQUM7Q0FDSjtBQWxDRCxnREFrQ0MifQ==