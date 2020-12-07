import {ValidatorResult} from 'jsonschema';
import {
    ContractEventEnum,
    ContractFsmEventEnum,
    ContractStatusEnum,
    IdentityType,
    OutsideServiceEventEnum,
    SubjectType
} from './enum';

export interface PageResult<T> {
    page: number;
    pageSize: number;
    totalItem: number;
    dataList: T[];
}

export interface ContractInfo {
    contractId: string;
    contractName: string;

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
    licenseeIdentityType: IdentityType;

    // 标的物相关信息
    subjectId: string;
    subjectName: string;
    subjectType: SubjectType;

    // 合同状态机部分
    fsmCurrentState?: string | null;
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
    policies: SubjectPolicyInfo[];
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

export interface ResourceInfo {
    resourceId: string;
    resourceName: string;
    userId: number;
    username: string;
    policies: SubjectPolicyInfo[];
    status: number;
}

export interface PresentableInfo {
    presentableId: string;
    presentableName: string;
    policies: SubjectPolicyInfo[];
    nodeId: number;
    onlineStatus: number;
}

export interface SubjectPolicyInfo {
    policyId: string;
    policyName: string;
    status: number;
}

export interface PolicyInfo {
    policyId: string;
    policyText: string;
    fsmDescriptionInfo?: FsmDescriptionInfo;
    subjectType: SubjectType;
}

export interface PolicyEventInfo {
    code: string;
    eventId: string;
    params?: {
        [paramName: string]: any;
    };
}

export interface FsmDescriptionInfo {
    [stateName: string]: FsmStateDescriptionInfo;
}

export interface FsmStateDescriptionInfo {
    isAuth: boolean;
    isTestAuth: boolean;
    transition: { [nextStateName: string]: PolicyEventInfo | null; };
}

export interface LicenseeInfo {
    licenseeId: string | number;
    licenseeName: string;
    licenseeOwnerId: number;
    licenseeOwnerName: string;
}

export interface UpdateContractBaseInfoOptions {
    contractName?: string;
    sortId?: number;
}

export interface BeSignSubjectOptions {
    subjectId: string;
    policyId: string;
}

export interface IContractService {

    findOne(condition: object, ...args): Promise<ContractInfo>;

    findById(contractId: string, ...args): Promise<ContractInfo>;

    find(condition: object, ...args): Promise<ContractInfo[]>;

    findByIds(contractIds: string[], ...args): Promise<ContractInfo[]>;

    findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<PageResult<ContractInfo>>;

    count(condition: object): Promise<number>;

    setDefaultExecContract(contract: ContractInfo): Promise<boolean>;

    updateContractInfo(contract: ContractInfo, options: any): Promise<boolean>;

    addContractChangedHistory(contract: ContractInfo, fromState: string, toState: string, event: string, triggerDate: Date);

    /**
     * 批量签约标的物
     * @param {BeSignSubjectOptions[]} subjects
     * @param {string | number} licenseeId
     * @param {identityType} IdentityType
     * @param {SubjectType} subjectType
     * @returns {Promise<ContractInfo[]>}
     */
    batchSignSubjects(subjects: BeSignSubjectOptions[], licenseeId: string | number, identityType: IdentityType, subjectType: SubjectType): Promise<ContractInfo[]>;

    fillContractPolicyInfo(contracts: ContractInfo[]): Promise<ContractInfo[]>;

    findLicenseeSignCounts(licenseeOwnerIds: number[], licenseeIdentityType: IdentityType): Promise<Array<{ licensorOwnerId: number, count: number }>>;
}

export interface IPolicyService {

    findOrCreatePolicy(subjectType: SubjectType, policyText: string): Promise<PolicyInfo>;

    findOrCreatePolicies(subjectType: SubjectType, policyTexts: string[]): Promise<PolicyInfo[]>;

    findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<PageResult<PolicyInfo>>;

    findOne(condition: object, ...args): Promise<PolicyInfo>;

    find(condition: object, ...args): Promise<PolicyInfo[]>;

    findByIds(policyIds: string[], ...args): Promise<PolicyInfo[]>;

    count(condition: object): Promise<number>;
}

export interface IOutsideApiService {

    getUserInfo(userId: number): Promise<UserInfo>;

    getNodeInfo(nodeId: number): Promise<NodeInfo>;

    getSubjectInfo(subjectId: string, subjectType: SubjectType): Promise<SubjectBaseInfo>;

    getSubjectInfos(subjectIds: string[], subjectType: SubjectType): Promise<SubjectBaseInfo[]>;

    getLicenseeInfo(licenseeId: string | number, identityType: IdentityType): Promise<LicenseeInfo>;
}

export interface IEventHandler {
    handle(...args): Promise<any>;
}

export interface IContractEventHandler {
    handle(eventEnum: ContractEventEnum, ...args): Promise<any>;
}

export interface IContractFsmEventHandler {
    handle(eventEnum: ContractFsmEventEnum, ...args): Promise<any>;
}

export interface IOutsideServiceEventHandler {
    handle(eventEnum: OutsideServiceEventEnum, ...args): Promise<any>;
}

export interface ICommonEventHandler {
    contractEventHandle(eventEnum: ContractEventEnum, ...args): Promise<any>;

    contractFsmEventHandle(eventEnum: ContractFsmEventEnum, ...args): Promise<any>;

    outsideServiceEventHandle(eventEnum: OutsideServiceEventEnum, ...args): Promise<any>;
}

/**
 * 针对object做校验的基础接口
 */
export interface IJsonSchemaValidate {
    validate(instance: object[] | object, ...args): ValidatorResult;
}

/**
 * 策略编译器
 */
export interface IPolicyCompiler {
    compiler(subjectType: SubjectType, policyText: string): PolicyInfo;
}

export interface IMongoConditionBuildOptions {
    operation?: string | undefined;
    isAllowEmptyArray?: boolean;
    isAllowEmptyString?: boolean;
    isSetProperty?: boolean;
}

export interface IMongoConditionBuilder {

    setString(field: string, value: string, options?: IMongoConditionBuildOptions): IMongoConditionBuilder;

    setNumber(field: string, value: number, options?: IMongoConditionBuildOptions): IMongoConditionBuilder;

    setArray(field: string, value: any[], options?: IMongoConditionBuildOptions): IMongoConditionBuilder;

    setRegex(field: string, value: RegExp, options?: IMongoConditionBuildOptions): IMongoConditionBuilder;

    setObject(field: string, value: object, options?: IMongoConditionBuildOptions): IMongoConditionBuilder;

    setAnyProperty(field: string, value: any, options?: IMongoConditionBuildOptions): IMongoConditionBuilder;

    verify(tips?: string | Error): IMongoConditionBuilder;

    print(): IMongoConditionBuilder;

    value(): object;

    build(): object;
}

export interface Interface {

}
