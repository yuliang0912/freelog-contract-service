import {scope, config, provide} from 'midway';
import {ContractInfo} from '../../interface';
import {hmacSha1} from 'egg-freelog-base/app/extend/helper/crypto_helper';
import {pick} from 'lodash';
import {ArgumentError} from 'egg-freelog-base';
import {SubjectType} from '../../enum';

@scope('Singleton')
@provide('contractInfoSignatureProvider')
export class ContractInfoSignatureProvider {

    @config('contractSignKey')
    contractSignKey: string;
    readonly contractUniqueKeySignFields = ['subjectId', 'subjectType', 'licenseeId', 'policyId', 'statusValue'];
    readonly contractBaseInfoSignFields = ['contractId', 'licensorId', 'licensorOwnerId', 'licenseeId', 'licenseeOwnerId', 'subjectId', 'subjectType', 'policyId', 'currentFsmState', 'createDate'];

    /**
     * 合同基础信息签名
     * @param {ContractInfo} contract
     * @returns {string}
     */
    contractBaseInfoSignature(contract: ContractInfo): string {
        return this._contractSignature(contract, this.contractBaseInfoSignFields, this.contractSignKey);
    }

    /**
     * 合同基础信息签名校验
     * @param {ContractInfo} contract
     * @returns {boolean}
     */
    contractBaseInfoSignatureVerify(contract: ContractInfo): boolean {
        if (!contract.signature) {
            return false;
        }
        return this.contractBaseInfoSignature(contract) === contract.signature;
    }

    /**
     * 合同基础信息唯一key生成
     * @param {ContractInfo} contract
     * @returns {string}
     */
    contractBaseInfoUniqueKeyGenerate(contract: ContractInfo | { subjectId: string, subjectType: SubjectType, licenseeId: string | number, policyId: string, status: number, contractId?: string }): string {
        // 正常终结允许重签的,则生成随机的key,绝不重复. 合约为终止或者异常的,不允许重签.
        contract['statusValue'] = contract.status === 1 ? contract.contractId : 'unique';
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
    _contractSignature(contract, signFields: string[], signKey: string): string {
        const signContractObject = pick(contract, signFields);
        const signContractObjectKeys = Object.keys(signContractObject).sort();
        if (signContractObjectKeys.length !== signFields.length) {
            throw new ArgumentError('contract is invalid');
        }
        const signText = signContractObjectKeys.map(key => signContractObject[key].toString()).join('-');

        return hmacSha1(signText, signKey);
    }
}
