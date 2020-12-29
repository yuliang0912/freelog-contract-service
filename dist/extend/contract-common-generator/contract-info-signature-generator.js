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
    constructor() {
        this.contractUniqueKeySignFields = ['subjectId', 'subjectType', 'licenseeId', 'policyId', 'statusValue'];
        this.contractBaseInfoSignFields = ['contractId', 'licensorId', 'licensorOwnerId', 'licenseeId', 'licenseeOwnerId', 'subjectId', 'subjectType', 'policyId', 'fsmCurrentState', 'createDate'];
    }
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
     * 合同基础信息唯一key生成
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
        const signContractObject = lodash_1.pick(contract, signFields);
        const signContractObjectKeys = Object.keys(signContractObject).sort();
        if (signContractObjectKeys.length !== signFields.length) {
            throw new egg_freelog_base_1.ArgumentError('contract is invalid, signature failed');
        }
        const signText = signContractObjectKeys.map(key => signContractObject[key].toString()).join('-');
        return egg_freelog_base_1.CryptoHelper.hmacSha1(signText, signKey);
    }
};
__decorate([
    midway_1.config('contractSignKey'),
    __metadata("design:type", String)
], ContractInfoSignatureProvider.prototype, "contractSignKey", void 0);
ContractInfoSignatureProvider = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('contractInfoSignatureProvider')
], ContractInfoSignatureProvider);
exports.ContractInfoSignatureProvider = ContractInfoSignatureProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtaW5mby1zaWduYXR1cmUtZ2VuZXJhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2V4dGVuZC9jb250cmFjdC1jb21tb24tZ2VuZXJhdG9yL2NvbnRyYWN0LWluZm8tc2lnbmF0dXJlLWdlbmVyYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBOEM7QUFFOUMsbUNBQTRCO0FBQzVCLHVEQUFrRztBQUlsRyxJQUFhLDZCQUE2QixHQUExQyxNQUFhLDZCQUE2QjtJQUExQztRQUlhLGdDQUEyQixHQUFHLENBQUMsV0FBVyxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3BHLCtCQUEwQixHQUFHLENBQUMsWUFBWSxFQUFFLFlBQVksRUFBRSxpQkFBaUIsRUFBRSxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFrRHBNLENBQUM7SUFoREc7Ozs7T0FJRztJQUNILHlCQUF5QixDQUFDLFFBQXNCO1FBQzVDLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsMEJBQTBCLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3BHLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsK0JBQStCLENBQUMsUUFBc0I7UUFDbEQsSUFBSSxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUU7WUFDdEIsT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFDRCxPQUFPLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLENBQUMsS0FBSyxRQUFRLENBQUMsU0FBUyxDQUFDO0lBQzNFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsaUNBQWlDLENBQUMsUUFBZ0s7UUFDOUwsdUNBQXVDO1FBQ3ZDLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxLQUFLLHFDQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUM7UUFDekgsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQywyQkFBMkIsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDckcsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsa0JBQWtCLENBQUMsUUFBUSxFQUFFLFVBQW9CLEVBQUUsT0FBZTtRQUU5RCxNQUFNLGtCQUFrQixHQUFHLGFBQUksQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDdEQsTUFBTSxzQkFBc0IsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdEUsSUFBSSxzQkFBc0IsQ0FBQyxNQUFNLEtBQUssVUFBVSxDQUFDLE1BQU0sRUFBRTtZQUNyRCxNQUFNLElBQUksZ0NBQWEsQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1NBQ3BFO1FBQ0QsTUFBTSxRQUFRLEdBQUcsc0JBQXNCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakcsT0FBTywrQkFBWSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDcEQsQ0FBQztDQUNKLENBQUE7QUFwREc7SUFEQyxlQUFNLENBQUMsaUJBQWlCLENBQUM7O3NFQUNGO0FBSGYsNkJBQTZCO0lBRnpDLGNBQUssQ0FBQyxXQUFXLENBQUM7SUFDbEIsZ0JBQU8sQ0FBQywrQkFBK0IsQ0FBQztHQUM1Qiw2QkFBNkIsQ0F1RHpDO0FBdkRZLHNFQUE2QiJ9