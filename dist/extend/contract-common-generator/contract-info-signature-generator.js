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
exports.ContractInfoSignatureProvider = void 0;
const midway_1 = require("midway");
const lodash_1 = require("lodash");
const egg_freelog_base_1 = require("egg-freelog-base");
let ContractInfoSignatureProvider = class ContractInfoSignatureProvider {
    contractSignKey;
    contractUniqueKeySignFields = ['subjectId', 'subjectType', 'licenseeId', 'policyId', 'statusValue'];
    contractBaseInfoSignFields = ['contractId', 'licensorId', 'licensorOwnerId', 'licenseeId', 'licenseeOwnerId', 'subjectId', 'subjectType', 'policyId', 'fsmCurrentState', 'createDate'];
    /**
     * 合同基础信息签名
     * @param {ContractInfo} contract
     * @returns {string}
     */
    contractBaseInfoSignature(contract) {
        return this._contractSignature(contract, this.contractBaseInfoSignFields, this.contractSignKey);
    }
    /**
     * 合同基础信息签名校验
     * @param {ContractInfo} contract
     * @returns {boolean}
     */
    contractBaseInfoSignatureVerify(contract) {
        if (!contract?.signature) {
            return false;
        }
        return this.contractBaseInfoSignature(contract) === contract.signature;
    }
    /**
     * 合同基础信息唯一key生成(防止重签,作为数据库unique)
     * @param {ContractInfo} contract
     * @returns {string}
     */
    contractBaseInfoUniqueKeyGenerate(contract) {
        // 只有正常终结的合同允许重签,其他状态的合约(正常或者异常等)不允许重签.
        contract['statusValue'] = contract.status === egg_freelog_base_1.ContractStatusEnum.Terminated ? contract.contractId : 'refuseSignContract';
        return this._contractSignature(contract, this.contractUniqueKeySignFields, this.contractSignKey);
    }
    /**
     * object字段签名
     * @param contract
     * @param signFields
     * @param signKey
     */
    _contractSignature(contract, signFields, signKey) {
        const signContractObject = (0, lodash_1.pick)(contract, signFields);
        const signContractObjectKeys = Object.keys(signContractObject).sort();
        if (signContractObjectKeys.length !== signFields.length) {
            throw new egg_freelog_base_1.ArgumentError('contract is invalid, signature failed');
        }
        const signText = signContractObjectKeys.map(key => signContractObject[key].toString()).join('-');
        return egg_freelog_base_1.CryptoHelper.hmacSha1(signText, signKey);
    }
};
__decorate([
    (0, midway_1.config)('contractSignKey'),
    __metadata("design:type", String)
], ContractInfoSignatureProvider.prototype, "contractSignKey", void 0);
ContractInfoSignatureProvider = __decorate([
    (0, midway_1.scope)('Singleton'),
    (0, midway_1.provide)('contractInfoSignatureProvider')
], ContractInfoSignatureProvider);
exports.ContractInfoSignatureProvider = ContractInfoSignatureProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtaW5mby1zaWduYXR1cmUtZ2VuZXJhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2V4dGVuZC9jb250cmFjdC1jb21tb24tZ2VuZXJhdG9yL2NvbnRyYWN0LWluZm8tc2lnbmF0dXJlLWdlbmVyYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBOEM7QUFFOUMsbUNBQTRCO0FBQzVCLHVEQUFrRztBQUlsRyxJQUFhLDZCQUE2QixHQUExQyxNQUFhLDZCQUE2QjtJQUd0QyxlQUFlLENBQVM7SUFDZiwyQkFBMkIsR0FBRyxDQUFDLFdBQVcsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUNwRywwQkFBMEIsR0FBRyxDQUFDLFlBQVksRUFBRSxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLGlCQUFpQixFQUFFLFlBQVksQ0FBQyxDQUFDO0lBRWhNOzs7O09BSUc7SUFDSCx5QkFBeUIsQ0FBQyxRQUFzQjtRQUM1QyxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLDBCQUEwQixFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNwRyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILCtCQUErQixDQUFDLFFBQXNCO1FBQ2xELElBQUksQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFO1lBQ3RCLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBQ0QsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsUUFBUSxDQUFDLEtBQUssUUFBUSxDQUFDLFNBQVMsQ0FBQztJQUMzRSxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGlDQUFpQyxDQUFDLFFBQWdLO1FBQzlMLHVDQUF1QztRQUN2QyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sS0FBSyxxQ0FBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDO1FBQ3pILE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsMkJBQTJCLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3JHLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILGtCQUFrQixDQUFDLFFBQVEsRUFBRSxVQUFvQixFQUFFLE9BQWU7UUFFOUQsTUFBTSxrQkFBa0IsR0FBRyxJQUFBLGFBQUksRUFBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDdEQsTUFBTSxzQkFBc0IsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdEUsSUFBSSxzQkFBc0IsQ0FBQyxNQUFNLEtBQUssVUFBVSxDQUFDLE1BQU0sRUFBRTtZQUNyRCxNQUFNLElBQUksZ0NBQWEsQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1NBQ3BFO1FBQ0QsTUFBTSxRQUFRLEdBQUcsc0JBQXNCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakcsT0FBTywrQkFBWSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDcEQsQ0FBQztDQUNKLENBQUE7QUFwREc7SUFEQyxJQUFBLGVBQU0sRUFBQyxpQkFBaUIsQ0FBQzs7c0VBQ0Y7QUFIZiw2QkFBNkI7SUFGekMsSUFBQSxjQUFLLEVBQUMsV0FBVyxDQUFDO0lBQ2xCLElBQUEsZ0JBQU8sRUFBQywrQkFBK0IsQ0FBQztHQUM1Qiw2QkFBNkIsQ0F1RHpDO0FBdkRZLHNFQUE2QiJ9