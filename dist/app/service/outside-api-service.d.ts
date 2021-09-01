import { ContractLicenseeIdentityTypeEnum, FreelogContext, SubjectTypeEnum } from 'egg-freelog-base';
import { IOutsideApiService, LicenseeInfo, NodeInfo, SubjectBaseInfo, UserInfo } from '../../interface';
export declare class OutsideApiService implements IOutsideApiService {
    readonly subjectWrapMap: Map<SubjectTypeEnum, (subjectIds: string[]) => Promise<SubjectBaseInfo[]>>;
    readonly licenseeWrapMap: Map<number, (licenseeId: string | number) => Promise<LicenseeInfo>>;
    ctx: FreelogContext;
    /**
     * 合约支付
     * @param fromAccountId
     * @param toAccountId
     * @param transactionAmount
     * @param contractId
     * @param subjectType
     * @param contractName
     * @param subjectName
     * @param eventId
     * @param password
     */
    contractPayment(fromAccountId: string, toAccountId: string, transactionAmount: number, contractId: string, subjectType: number, subjectName: string, contractName: string, eventId: string, password: string): Promise<any>;
    /**
     * 查询交易记录信息
     * @param transactionRecordId
     */
    getTransactionRecordInfo(transactionRecordId: string): Promise<any>;
    /**
     * 获取用户信息
     * @param {number} userId
     * @returns {Promise<UserInfo>}
     */
    getUserInfo(userId: number): Promise<UserInfo>;
    /**
     * 获取用户交易账号
     */
    getIndividualTransactionAccounts(userId: number): Promise<any>;
    /**
     * 获取节点信息
     * @param {number} nodeId
     * @returns {Promise<NodeInfo>}
     */
    getNodeInfo(nodeId: number): Promise<NodeInfo>;
    /**
     * 获取标的物信息
     * @param subjectId
     * @param subjectType
     */
    getSubjectInfo(subjectId: string, subjectType: SubjectTypeEnum): Promise<SubjectBaseInfo>;
    /**
     * 批量获取标的物信息
     * @param subjectIds
     * @param subjectType
     */
    getSubjectInfos(subjectIds: string[], subjectType: SubjectTypeEnum): Promise<SubjectBaseInfo[]>;
    /**
     * 获取乙方信息
     * @param licenseeId
     * @param identityType
     */
    getLicenseeInfo(licenseeId: string | number, identityType: ContractLicenseeIdentityTypeEnum): Promise<LicenseeInfo>;
    /**
     * 资源信息转换为标的物基础信息
     * @param {string[]} resourceIds
     * @returns {Promise<SubjectBaseInfo[]>}
     * @private
     */
    _resourceInfoWrapToSubjectBaseInfo(resourceIds: string[]): Promise<SubjectBaseInfo[]>;
    /**
     * 展品信息转换为标的物信息
     * @param {string[]} presentableIds
     * @returns {Promise<SubjectBaseInfo[]>}
     * @private
     */
    _presentableWrapToSubjectBaseInfo(presentableIds: string[]): Promise<SubjectBaseInfo[]>;
    /**
     * 乙方作为资源时,转换乙方信息
     * @param {string} resourceId
     * @returns {Promise<LicenseeInfo>}
     * @private
     */
    _resourceInfoWrapToLicenseeInfo(resourceId: string): Promise<LicenseeInfo>;
    /**
     * 节点信息转换为乙方信息
     * @param {number} nodeId
     * @returns {Promise<LicenseeInfo>}
     * @private
     */
    _nodeInfoWrapToLicenseeInfo(nodeId: number): Promise<LicenseeInfo>;
    /**
     * 用户信息转换为乙方
     * @param {number} userId
     * @returns {Promise<LicenseeInfo>}
     * @private
     */
    _userInfoWrapToLicenseeInfo(userId: number): Promise<LicenseeInfo>;
    _initial(): void;
}
