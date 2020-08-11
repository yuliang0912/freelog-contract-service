import { ValidatorResult } from 'jsonschema';
import { ContractEventEnum, ContractFsmEventEnum, ContractStatusEnum, IdentityType, OutsideServiceEventEnum, SubjectType } from './enum';
export interface PageResult {
    page: number;
    pageSize: number;
    totalItem: number;
    dataList: any[];
}
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
    licenseeIdentityType: IdentityType;
    subjectId: string;
    subjectName: string;
    subjectType: SubjectType;
    fsmCurrentState?: string | null;
    fsmRunningStatus?: number;
    fsmDeclarations?: object;
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
    fsmDescriptionInfo?: object;
    subjectType: SubjectType;
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
    findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<PageResult>;
    count(condition: object): Promise<number>;
    setDefaultExecContract(contract: ContractInfo): Promise<boolean>;
    updateContractInfo(contract: ContractInfo, options: any): Promise<boolean>;
    addContractChangedHistory(contract: ContractInfo, fromState: string, toState: string, event: string, triggerDate: Date): any;
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
}
export interface IPolicyService {
    findOrCreatePolicy(subjectType: SubjectType, policyName: string, policyText: string): Promise<PolicyInfo>;
    findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<PageResult>;
    findOne(condition: object, ...args: any[]): Promise<PolicyInfo>;
    find(condition: object, ...args: any[]): Promise<PolicyInfo[]>;
    findByIds(policyIds: string[], ...args: any[]): Promise<PolicyInfo[]>;
    count(condition: object): Promise<number>;
    updatePolicy(policyInfo: PolicyInfo, policyName: string): Promise<boolean>;
}
export interface IOutsideApiService {
    getUserInfo(userId: number): Promise<UserInfo>;
    getNodeInfo(nodeId: number): Promise<NodeInfo>;
    getSubjectInfo(subjectId: string, subjectType: SubjectType): Promise<SubjectBaseInfo>;
    getSubjectInfos(subjectIds: string[], subjectType: SubjectType): Promise<SubjectBaseInfo[]>;
    getLicenseeInfo(licenseeId: string | number, identityType: IdentityType): Promise<LicenseeInfo>;
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
 * 针对object做校验的基础接口
 */
export interface IJsonSchemaValidate {
    validate(instance: object[] | object, ...args: any[]): ValidatorResult;
}
/**
 * 策略编译器
 */
export interface IPolicyCompiler {
    compiler(userId: number, subjectType: SubjectType, policyText: string, policyName: string): any;
}
