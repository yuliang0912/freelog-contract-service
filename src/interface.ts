import {
    ContractAuthStatusEnum, ContractEventEnum, ContractFsmEventEnum,
    ContractFsmRunningStatusEnum,
    OutsideServiceEventEnum
} from './enum';
import {PageResult, SubjectTypeEnum, ContractStatusEnum, ContractLicenseeIdentityTypeEnum} from 'egg-freelog-base';
import {EachBatchPayload} from "kafkajs";
import {ClientSession} from "mongoose";

/**
 * 合约信息
 */
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
    licenseeIdentityType: ContractLicenseeIdentityTypeEnum;

    // 标的物相关信息
    subjectId: string;
    subjectName: string;
    subjectType: SubjectTypeEnum;

    // 合同状态机部分
    fsmCurrentState?: string | null;
    fsmRunningStatus?: ContractFsmRunningStatusEnum;
    fsmDeclarations?: object;

    // 其他信息
    policyId: string;
    sortId?: number;
    signature?: string;
    status?: ContractStatusEnum;
    authStatus: ContractAuthStatusEnum;
    uniqueKey?: string;
    createDate?: Date;

    policyInfo?: PolicyInfo;
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
    // subjectOriginalInfo: object | any;
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
    fsmDeclarationInfo?: any;
    subjectType: SubjectTypeEnum;
}

export interface PolicyEventInfo {
    code: string;
    service: string;
    name: string;
    eventId: string;
    args?: {
        [paramName: string]: any;
    };
}

export interface FsmDescriptionInfo {
    [stateName: string]: FsmStateDescriptionInfo;
}

export interface FsmStateDescriptionInfo {
    isAuth: boolean;
    isTestAuth: boolean;
    isInitial?: boolean;
    isTerminate?: boolean;
    serviceStates: string[];
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

    findIntervalList(condition: object, skip?: number, limit?: number, projection?: string[], sort?: object): Promise<PageResult<ContractInfo>>;

    count(condition: object): Promise<number>;

    setDefaultExecContract(contract: ContractInfo): Promise<boolean>;

    updateContractInfo(contract: ContractInfo, options: any): Promise<boolean>;

    addContractChangedHistory(contract: ContractInfo, fromState: string, toState: string, event: string, triggerDate: Date);

    /**
     * 批量签约标的物
     * @param subjects
     * @param licenseeId
     * @param identityType
     * @param subjectType
     */
    batchSignSubjects(subjects: BeSignSubjectOptions[], licenseeId: string | number, identityType: ContractLicenseeIdentityTypeEnum, subjectType: SubjectTypeEnum): Promise<ContractInfo[]>;

    fillContractPolicyInfo(contracts: ContractInfo[]): Promise<ContractInfo[]>;

    findLicenseeSignCounts(licenseeOwnerIds: number[], licenseeIdentityType: ContractLicenseeIdentityTypeEnum): Promise<Array<{ licensorOwnerId: number, count: number }>>;
}

export interface IPolicyService {

    findOrCreatePolicy(subjectType: SubjectTypeEnum, policyText: string): Promise<PolicyInfo>;

    findOrCreatePolicies(subjectType: SubjectTypeEnum, policyTexts: string[]): Promise<PolicyInfo[]>;

    findOne(condition: object, ...args): Promise<PolicyInfo>;

    find(condition: object, ...args): Promise<PolicyInfo[]>;

    findByIds(policyIds: string[], ...args): Promise<PolicyInfo[]>;

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
 * 策略编译器
 */
export interface IPolicyCompiler {
    compiler(subjectType: SubjectTypeEnum, policyText: string): Promise<PolicyInfo>;
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

export interface IKafkaSubscribeMessageHandle {

    subscribeTopicName: string;

    consumerGroupId: string;

    messageHandle(payload: EachBatchPayload): Promise<void>;
}

export interface IContractStateMachine {

    isCanExecEvent(eventId: string): boolean;
    
    execInitial(session: ClientSession): Promise<any>;

    execContractEvent(session: ClientSession, eventInfo: IContractTriggerEventMessage, ...args): Promise<any>;
}

export interface IContractTriggerEventMessage {
    contractId: string;
    code: string;
    service: string;
    name: string;
    eventId: string;
    eventTime: Date;
    triggerUserId: number;
    args?: {
        [paramName: string]: number | string | Date;
    };
}
