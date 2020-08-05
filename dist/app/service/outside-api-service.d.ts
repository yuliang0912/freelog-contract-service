import { SubjectType, IdentityType } from '../../enum';
import { IOutsideApiService, LicenseeInfo, NodeInfo, SubjectBaseInfo, UserInfo } from '../../interface';
export declare class OutsideApiService implements IOutsideApiService {
    readonly subjectWrapMap: Map<SubjectType, (subjectIds: string[]) => Promise<SubjectBaseInfo[]>>;
    readonly licenseeWrapMap: Map<number, (licenseeId: string | number) => Promise<LicenseeInfo>>;
    ctx: any;
    /**
     * 获取用户信息
     * @param {number} userId
     * @returns {Promise<UserInfo>}
     */
    getUserInfo(userId: number): Promise<UserInfo>;
    /**
     * 获取节点信息
     * @param {number} nodeId
     * @returns {Promise<NodeInfo>}
     */
    getNodeInfo(nodeId: number): Promise<NodeInfo>;
    /**
     * 获取标的物信息
     * @param {string} subjectId 标的物ID
     * @param {SubjectType} subjectType 标的物类型
     * @returns {Promise<SubjectBaseInfo>}
     */
    getSubjectInfo(subjectId: string, subjectType: SubjectType): Promise<SubjectBaseInfo>;
    /**
     * 批量获取标的物信息
     * @param subjectIds
     * @param subjectType
     */
    getSubjectInfos(subjectIds: string[], subjectType: SubjectType): Promise<SubjectBaseInfo[]>;
    /**
     * 获取乙方信息
     * @param {string | number} licenseeId
     * @param {IdentityType} identityType
     * @returns {Promise<LicenseeInfo>}
     */
    getLicenseeInfo(licenseeId: string | number, identityType: IdentityType): Promise<LicenseeInfo>;
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
