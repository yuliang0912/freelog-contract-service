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
const crypto_helper_1 = require("egg-freelog-base/app/extend/helper/crypto_helper");
const lodash_1 = require("lodash");
const egg_freelog_base_1 = require("egg-freelog-base");
const enum_1 = require("../../enum");
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
        contract['statusValue'] = contract.status === enum_1.ContractStatusEnum.Terminated ? contract.contractId : 'refuseSignContract';
        return this._contractSignature(contract, this.contractUniqueKeySignFields, this.contractSignKey);
    }
    /**
     * object字段签名
     * @param {ContractInfo} object
     * @param {string[]} signFields
     * @param {string} signKey
     * @returns {string}
     * @private
     */
    _contractSignature(contract, signFields, signKey) {
        const signContractObject = lodash_1.pick(contract, signFields);
        const signContractObjectKeys = Object.keys(signContractObject).sort();
        if (signContractObjectKeys.length !== signFields.length) {
            throw new egg_freelog_base_1.ArgumentError('contract is invalid, signature failed');
        }
        const signText = signContractObjectKeys.map(key => signContractObject[key].toString()).join('-');
        return crypto_helper_1.hmacSha1(signText, signKey);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtaW5mby1zaWduYXR1cmUtZ2VuZXJhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2V4dGVuZC9jb250cmFjdC1jb21tb24tZ2VuZXJhdG9yL2NvbnRyYWN0LWluZm8tc2lnbmF0dXJlLWdlbmVyYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBOEM7QUFFOUMsb0ZBQTBFO0FBQzFFLG1DQUE0QjtBQUM1Qix1REFBK0M7QUFDL0MscUNBQTJEO0FBSTNELElBQWEsNkJBQTZCLEdBQTFDLE1BQWEsNkJBQTZCO0lBQTFDO1FBSWEsZ0NBQTJCLEdBQUcsQ0FBQyxXQUFXLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDcEcsK0JBQTBCLEdBQUcsQ0FBQyxZQUFZLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixFQUFFLFlBQVksRUFBRSxpQkFBaUIsRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSxZQUFZLENBQUMsQ0FBQztJQW9EcE0sQ0FBQztJQWxERzs7OztPQUlHO0lBQ0gseUJBQXlCLENBQUMsUUFBc0I7UUFDNUMsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQywwQkFBMEIsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDcEcsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCwrQkFBK0IsQ0FBQyxRQUFzQjtRQUNsRCxJQUFJLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRTtZQUN0QixPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUNELE9BQU8sSUFBSSxDQUFDLHlCQUF5QixDQUFDLFFBQVEsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxTQUFTLENBQUM7SUFDM0UsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxpQ0FBaUMsQ0FBQyxRQUE0SjtRQUMxTCx1Q0FBdUM7UUFDdkMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEtBQUsseUJBQWtCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQztRQUN6SCxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLDJCQUEyQixFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNyRyxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILGtCQUFrQixDQUFDLFFBQVEsRUFBRSxVQUFvQixFQUFFLE9BQWU7UUFFOUQsTUFBTSxrQkFBa0IsR0FBRyxhQUFJLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3RELE1BQU0sc0JBQXNCLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3RFLElBQUksc0JBQXNCLENBQUMsTUFBTSxLQUFLLFVBQVUsQ0FBQyxNQUFNLEVBQUU7WUFDckQsTUFBTSxJQUFJLGdDQUFhLENBQUMsdUNBQXVDLENBQUMsQ0FBQztTQUNwRTtRQUNELE1BQU0sUUFBUSxHQUFHLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pHLE9BQU8sd0JBQVEsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDdkMsQ0FBQztDQUNKLENBQUE7QUF0REc7SUFEQyxlQUFNLENBQUMsaUJBQWlCLENBQUM7O3NFQUNGO0FBSGYsNkJBQTZCO0lBRnpDLGNBQUssQ0FBQyxXQUFXLENBQUM7SUFDbEIsZ0JBQU8sQ0FBQywrQkFBK0IsQ0FBQztHQUM1Qiw2QkFBNkIsQ0F5RHpDO0FBekRZLHNFQUE2QiJ9