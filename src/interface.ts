import {ValidatorResult} from 'jsonschema';
import {ContractStatusEnum, ContractType, SubjectType} from './enum';

export interface ContractPolicyInfo {
    policyId: string;
    policyText: string;
    fsmDescriptionInfo: object;
    status?: number;
}

export interface ContractInfo {
    contractId: string;
    contractName: string;
    contractType: ContractType;

    // 甲方相关信息
    licensorId: string | number;
    licensorName: string;
    licensorOwnerId: number;
    licensorOwnerName: string;

    // 乙方相关信息
    licenseeId: string | number;
    licenseeName: string;
    licenseeOwnerId: number;
    licenseeOwnerName: string;

    // 标的物相关信息
    subjectId: string;
    subjectName: string;
    subjectType: SubjectType;

    // 合同状态机部分
    fsmCurrentState?: string;
    fsmRunningStatus?: number;
    fsmDeclarations?: object;

    // 其他信息
    policyId: string;
    sortId?: number;
    signature?: string;
    status?: ContractStatusEnum;
    authStatus: number;
    uniqueKey?: string;
    createDate?: Date;
}

export interface SubjectBaseInfo {
    subjectId: string;
    subjectType: SubjectType;
    subjectName: string;
    licensorId: string | number;
    licensorName: string;
    licensorOwnerId: number;
    licensorOwnerName: string;
    policies: PolicyInfo[];
    // subjectOriginalInfo: object | any;
}

export interface NodeInfo {
    nodeId: number;
    nodeName: string;
    nodeDomain: string;
    ownerUserId: number;
}

export interface UserInfo {
    userId: number;
    username: string;
}

export interface PolicyInfo {
    policyId: string;
    policyName?: string;
    policyText: string;
    status?: number;
}

export interface LicenseeInfo {
    licenseeId: string | number;
    licenseeName: string;
    licenseeOwnerId: number;
    licenseeOwnerName: string;
}

export interface UpdateContractBaseInfoOptions {
    contractName?: string;
    sortIndex?: number;
}

export interface BeSignSubjectOptions {
    subjectId: string;
    subjectType: SubjectType;
    policyId: string;
}

// export toBeSigned

export interface IContractService {

    findOne(condition: object, ...args): Promise<ContractInfo>;

    findById(contractId: string, ...args): Promise<ContractInfo>;

    find(condition: object, ...args): Promise<ContractInfo[]>;

    findByIds(contractIds: string[], ...args): Promise<ContractInfo[]>;

    findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<ContractInfo[]>;

    count(condition: object): Promise<number>;

    setDefaultExecContract(contract: ContractInfo): Promise<boolean>;

    updateContractInfo(contract: ContractInfo, options: any): Promise<boolean>;

    addContractChangedHistory(contract: ContractInfo, fromState: string, toState: string, event: string, triggerDate: Date);

    /**
     * 签约标的物
     * @param {CreateContractOptions} options
     * @param {string | number} licenseeId
     * @param {ContractType} contractType
     * @returns {Promise<ContractInfo>}
     */
    signSubject(options: BeSignSubjectOptions, licenseeId: string | number, contractType: ContractType, sortId?: number): Promise<ContractInfo>;

    /**
     * 批量签约标的物
     * @param {BeSignSubjectOptions[]} subjects
     * @param {string | number} licenseeId
     * @param {ContractType} contractType
     * @param {SubjectType} subjectType
     * @returns {Promise<ContractInfo[]>}
     */
    batchSignSubjects(subjects: BeSignSubjectOptions[], licenseeId: string | number, contractType: ContractType, subjectType: SubjectType): Promise<ContractInfo[]>;
}

export interface IPolicyService {

    findOrCreatePolicy(subjectType: SubjectType, policyText: string): Promise<ContractPolicyInfo>;

    findOne(condition: object, ...args): Promise<ContractPolicyInfo>;

    find(condition: object, ...args): Promise<ContractPolicyInfo[]>;

    findByIds(policyIds: string[], ...args): Promise<ContractPolicyInfo[]>;
}

export interface IOutsideApiService {

    getUserInfo(userId: number): Promise<UserInfo>;

    getNodeInfo(nodeId: number): Promise<NodeInfo>;

    getSubjectInfo(subjectId: string, subjectType: SubjectType): Promise<SubjectBaseInfo>;

    getSubjectInfos(subjectIds: string[], subjectType: SubjectType): Promise<SubjectBaseInfo[]>;

    getLicenseeInfo(licenseeId: string | number, contractType: ContractType): Promise<LicenseeInfo>;
}

export interface IEventHandler {
    handle(...args): Promise<any>;
}

/**
 * 针对object做校验的基础接口
 */
export interface IJsonSchemaValidate {
    validate(instance: object[] | object, ...args): ValidatorResult;
}
