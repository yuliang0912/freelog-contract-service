import {
    ContractAuthStatusEnum, ContractEventEnum, ContractFsmEventEnum,
    ContractFsmRunningStatusEnum,
    OutsideServiceEventEnum
} from './enum';
import {PageResult, SubjectTypeEnum, ContractStatusEnum, ContractLicenseeIdentityTypeEnum} from 'egg-freelog-base';
import {EachMessagePayload} from 'kafkajs';
import {ClientSession} from 'mongoose';

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
    fsmDeclarations?: {
        [key: string]: any;
    };

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
    status: number;
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
    translateInfo?: any;
}

export interface PolicyEventInfo {
    code: string;
    service: string;
    name: string;
    eventId: string;
    toState: string;
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
    transitions: PolicyEventInfo[];
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

    findContractById(contractId: string, isLoadingPolicy): Promise<ContractInfo>;

    findContractByIds(contractIds: string[], isLoadingPolicy): Promise<ContractInfo[]>

    findOne(condition: object, ...args): Promise<ContractInfo>;

    findById(contractId: string, ...args): Promise<ContractInfo>;

    find(condition: object, ...args): Promise<ContractInfo[]>;

    findByIds(contractIds: string[], ...args): Promise<ContractInfo[]>;

    findIntervalList(condition: object, skip?: number, limit?: number, projection?: string[], sort?: object): Promise<PageResult<ContractInfo>>;

    count(condition: object): Promise<number>;

    /**
     * 获取标的物签约次数(同一个用户去重)
     * @param subjectType
     * @param subjectIds
     */
    findSubjectSignCounts(subjectType: SubjectTypeEnum, subjectIds: string[]);

    setDefaultExecContract(contract: ContractInfo): Promise<boolean>;

    updateContractInfo(contract: ContractInfo, options: any): Promise<boolean>;

    /**
     * C端用户签约展品
     * @param presentableId
     * @param policyId
     * @param licenseeId
     */
    signClientUserPresentable(presentableId: string, policyId: string, licenseeId: number): Promise<ContractInfo[]>;

    /**
     * 批量签约标的物
     * @param subjects
     * @param licenseeId
     * @param identityType
     * @param subjectType
     * @param isWaitInitial
     */
    batchSignSubjects(subjects: BeSignSubjectOptions[], licenseeId: string | number, identityType: ContractLicenseeIdentityTypeEnum, subjectType: SubjectTypeEnum, isWaitInitial: boolean): Promise<ContractInfo[]>;

    fillContractPolicyInfo(contracts: ContractInfo[], isTranslate?: boolean): Promise<ContractInfo[]>;

    findLicenseeSignCounts(licenseeOwnerIds: number[], licenseeIdentityType: ContractLicenseeIdentityTypeEnum): Promise<Array<{ licensorOwnerId: number, count: number }>>;

    findContractTransitionRecords(condition: object, projection?: string, options?: object): Promise<ContractTransitionRecord[]>;

    findIntervalContractTransitionRecords(condition: object, skip?: number, limit?: number, projection?: string[], sort?: object): Promise<PageResult<ContractTransitionRecord>>;
}

export interface IPolicyService {

    policyTranslate(policies: PolicyInfo[]): PolicyInfo[];

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

    messageHandle(payload: EachMessagePayload): Promise<void>;
}

export interface IContractStateMachine {

    contractInfo: ContractInfo;

    getEventInfo(eventId: string): PolicyEventInfo;

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

export interface ContractTransitionRecord {
    _id?: string;
    stateId?: string;
    contractId: string;
    eventId: string;
    fromState: string;
    toState: string;
    eventInfo: IContractTriggerEventMessage;
}

export interface IContractAuthStatusChangedEventMessage {
    contractId: string;
    subjectId: string;
    subjectName: string;
    subjectType: SubjectTypeEnum;
    licenseeId: string | number;
    licenseeOwnerId: number;
    licensorId: string | number;
    licensorOwnerId: number;
    beforeAuthStatus: ContractAuthStatusEnum;
    afterAuthStatus: ContractAuthStatusEnum;
    contractStatus: ContractStatusEnum;
    licenseeIdentityType: ContractLicenseeIdentityTypeEnum;
}
