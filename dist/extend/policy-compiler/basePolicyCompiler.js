"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePolicyCompiler = void 0;
const crypto_helper_1 = require("egg-freelog-base/app/extend/helper/crypto_helper");
const egg_freelog_base_1 = require("egg-freelog-base");
class BasePolicyCompiler {
    compiler(userId, subjectType, policyText, policyName) {
        throw new egg_freelog_base_1.ApplicationError('compiler not implemented');
    }
    compilerErrorHandle(error) {
        throw new egg_freelog_base_1.ApplicationError(`policy compiler error:${error}`);
    }
    /**
     * 生成策略Id
     * @param policyText
     */
    generatePolicyId(userId, subjectType, policyText) {
        return crypto_helper_1.md5(policyText.replace(/\s{2,}/g, '') + '_userId:' + userId + '_subjectType:' + subjectType);
    }
}
exports.BasePolicyCompiler = BasePolicyCompiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZVBvbGljeUNvbXBpbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2V4dGVuZC9wb2xpY3ktY29tcGlsZXIvYmFzZVBvbGljeUNvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLG9GQUFxRTtBQUVyRSx1REFBa0Q7QUFFbEQsTUFBYSxrQkFBa0I7SUFFM0IsUUFBUSxDQUFDLE1BQWMsRUFBRSxXQUF3QixFQUFFLFVBQWtCLEVBQUUsVUFBa0I7UUFDckYsTUFBTSxJQUFJLG1DQUFnQixDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVELG1CQUFtQixDQUFDLEtBQUs7UUFDckIsTUFBTSxJQUFJLG1DQUFnQixDQUFDLHlCQUF5QixLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFRDs7O09BR0c7SUFDSCxnQkFBZ0IsQ0FBQyxNQUFjLEVBQUUsV0FBd0IsRUFBRSxVQUFrQjtRQUN6RSxPQUFPLG1CQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLEdBQUcsVUFBVSxHQUFHLE1BQU0sR0FBRyxlQUFlLEdBQUcsV0FBVyxDQUFDLENBQUM7SUFDeEcsQ0FBQztDQUNKO0FBakJELGdEQWlCQyJ9