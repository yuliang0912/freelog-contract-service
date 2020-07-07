import {ContractType, SubjectType} from './enum';

export interface ContractPolicyInfo {
    policyId: string;
    policyName?: string;
    policyText?: string;
    fsmDescriptionInfo?: object;
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
    contractPolicyInfo?: ContractPolicyInfo;
    fsmCurrentState?: string;
    fsmRunningStatus?: number;
    fsmDeclarations?: object;

    // 其他信息
    policyId: string;
    sortId?: number;
    signature?: string;
    status?: number;
    authStatus: number;
    uniqueKey?: string;
    policyInfo?: PolicyInfo;
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

    updateContractInfo(contract: ContractInfo, options: any): Promise<boolean>;

    addContractChangedHistory(contract: ContractInfo, fromState: string, toState: string, event: string, triggerDate: Date);
}

export interface IOutsideApiService {

    getUserInfo(userId: number): Promise<UserInfo>;

    getNodeInfo(nodeId: number): Promise<NodeInfo>;

    getSubjectInfo(subjectId: string, subjectType: string): Promise<SubjectBaseInfo>;

    getSubjectInfos(subjectIds: string[], subjectType: SubjectType): Promise<SubjectBaseInfo[]>;

    getLicenseeInfo(licenseeId: string | number, contractType: ContractType): Promise<LicenseeInfo>;
}

export interface IEventHandler {
    handle(...args): Promise<any>;
}
