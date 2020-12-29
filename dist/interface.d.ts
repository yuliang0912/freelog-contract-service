import { ContractAuthStatusEnum, ContractEventEnum, ContractFsmEventEnum, OutsideServiceEventEnum } from './enum';
import { PageResult, SubjectTypeEnum, ContractStatusEnum, ContractLicenseeIdentityTypeEnum } from 'egg-freelog-base';
/**
 * 合约信息
 */
export interface ContractInfo {
    contractId: string;
    contractName: string;
    licensorId: string | number;
    licensorName: string;
    licensorOwnerId: number;
    licensorOwnerName: string;
    licenseeId: string | number;
    licenseeName: string;
    licenseeOwnerId: number;
    licenseeOwnerName: string;
    licenseeIdentityType: ContractLicenseeIdentityTypeEnum;
    subjectId: string;
    subjectName: string;
    subjectType: SubjectTypeEnum;
    fsmCurrentState?: string | null;
    fsmRunningStatus?: number;
    fsmDeclarations?: object;
    policyId: string;
    sortId?: number;
    signature?: string;
    status?: ContractStatusEnum;
    authStatus: ContractAuthStatusEnum;
    uniqueKey?: string;
    createDate?: Date;
}
export interface SubjectBaseInfo {
    subjectId: string;
    subjectType: SubjectTypeEnum;
    subjectName: string;
    licensorId: string | number;
    licensorName: string;
    licensorOwnerId: number;
    licensorOwnerName: string;
    policies: SubjectPolicyInfo[];
}
export interface NodeInfo {
    nodeId: number;
    nodeName: string;
    nodeDomain: string;
    ownerUserId: number;
    ownerUserName: string;
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
    subjectType: SubjectTypeEnum;
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
    transition: {
        [nextStateName: string]: PolicyEventInfo | null;
    };
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
    findOne(condition: object, ...args: any[]): Promise<ContractInfo>;
    findById(contractId: string, ...args: any[]): Promise<ContractInfo>;
    find(condition: object, ...args: any[]): Promise<ContractInfo[]>;
    findByIds(contractIds: string[], ...args: any[]): Promise<ContractInfo[]>;
    findIntervalList(condition: object, skip?: number, limit?: number, projection?: string[], sort?: object): Promise<PageResult<ContractInfo>>;
    count(condition: object): Promise<number>;
    setDefaultExecContract(contract: ContractInfo): Promise<boolean>;
    updateContractInfo(contract: ContractInfo, options: any): Promise<boolean>;
    addContractChangedHistory(contract: ContractInfo, fromState: string, toState: string, event: string, triggerDate: Date): any;
    /**
     * 批量签约标的物
     * @param subjects
     * @param licenseeId
     * @param identityType
     * @param subjectType
     */
    batchSignSubjects(subjects: BeSignSubjectOptions[], licenseeId: string | number, identityType: ContractLicenseeIdentityTypeEnum, subjectType: SubjectTypeEnum): Promise<ContractInfo[]>;
    fillContractPolicyInfo(contracts: ContractInfo[]): Promise<ContractInfo[]>;
    findLicenseeSignCounts(licenseeOwnerIds: number[], licenseeIdentityType: ContractLicenseeIdentityTypeEnum): Promise<Array<{
        licensorOwnerId: number;
        count: number;
    }>>;
}
export interface IPolicyService {
    findOrCreatePolicy(subjectType: SubjectTypeEnum, policyText: string): Promise<PolicyInfo>;
    findOrCreatePolicies(subjectType: SubjectTypeEnum, policyTexts: string[]): Promise<PolicyInfo[]>;
    findOne(condition: object, ...args: any[]): Promise<PolicyInfo>;
    find(condition: object, ...args: any[]): Promise<PolicyInfo[]>;
    findByIds(policyIds: string[], ...args: any[]): Promise<PolicyInfo[]>;
    count(condition: object): Promise<number>;
}
export interface IOutsideApiService {
    getUserInfo(userId: number): Promise<UserInfo>;
    getNodeInfo(nodeId: number): Promise<NodeInfo>;
    getSubjectInfo(subjectId: string, subjectType: SubjectTypeEnum): Promise<SubjectBaseInfo>;
    getSubjectInfos(subjectIds: string[], subjectType: SubjectTypeEnum): Promise<SubjectBaseInfo[]>;
    getLicenseeInfo(licenseeId: string | number, identityType: ContractLicenseeIdentityTypeEnum): Promise<LicenseeInfo>;
}
export interface IEventHandler {
    handle(...args: any[]): Promise<any>;
}
export interface IContractEventHandler {
    handle(eventEnum: ContractEventEnum, ...args: any[]): Promise<any>;
}
export interface IContractFsmEventHandler {
    handle(eventEnum: ContractFsmEventEnum, ...args: any[]): Promise<any>;
}
export interface IOutsideServiceEventHandler {
    handle(eventEnum: OutsideServiceEventEnum, ...args: any[]): Promise<any>;
}
export interface ICommonEventHandler {
    contractEventHandle(eventEnum: ContractEventEnum, ...args: any[]): Promise<any>;
    contractFsmEventHandle(eventEnum: ContractFsmEventEnum, ...args: any[]): Promise<any>;
    outsideServiceEventHandle(eventEnum: OutsideServiceEventEnum, ...args: any[]): Promise<any>;
}
/**
 * 策略编译器
 */
export interface IPolicyCompiler {
    compiler(subjectType: SubjectTypeEnum, policyText: string): PolicyInfo;
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
