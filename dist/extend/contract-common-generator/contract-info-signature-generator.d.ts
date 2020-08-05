import { ContractInfo } from '../../interface';
import { SubjectType } from '../../enum';
export declare class ContractInfoSignatureProvider {
    contractSignKey: string;
    readonly contractUniqueKeySignFields: string[];
    readonly contractBaseInfoSignFields: string[];
    /**
     * 合同基础信息签名
     * @param {ContractInfo} contract
     * @returns {string}
     */
    contractBaseInfoSignature(contract: ContractInfo): string;
    /**
     * 合同基础信息签名校验
     * @param {ContractInfo} contract
     * @returns {boolean}
     */
    contractBaseInfoSignatureVerify(contract: ContractInfo): boolean;
    /**
     * 合同基础信息唯一key生成
     * @param {ContractInfo} contract
     * @returns {string}
     */
    contractBaseInfoUniqueKeyGenerate(contract: ContractInfo | {
        subjectId: string;
        subjectType: SubjectType;
        licenseeId: string | number;
        policyId: string;
        status: number;
        contractId?: string;
    }): string;
    /**
     * object字段签名
     * @param {ContractInfo} object
     * @param {string[]} signFields
     * @param {string} signKey
     * @returns {string}
     * @private
     */
    _contractSignature(contract: any, signFields: string[], signKey: string): string;
}
