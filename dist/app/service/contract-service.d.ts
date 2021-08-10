import { ContractInfo, BeSignSubjectOptions, IContractService, IOutsideApiService, IPolicyService, PolicyInfo, IContractStateMachine, ContractTransitionRecord } from '../../interface';
import { FreelogContext, ContractLicenseeIdentityTypeEnum, SubjectTypeEnum, PageResult, IMongodbOperation } from 'egg-freelog-base';
export declare class ContractService implements IContractService {
    mongoose: any;
    ctx: FreelogContext;
    contractInfoProvider: IMongodbOperation<ContractInfo>;
    policyService: IPolicyService;
    contractInfoSignatureProvider: any;
    outsideApiService: IOutsideApiService;
    contractTransitionRecordProvider: IMongodbOperation<ContractTransitionRecord>;
    buildContractStateMachine: (contractInfo: ContractInfo) => IContractStateMachine;
    /**
     * 根据ID获取合约
     * @param contractId
     * @param isLoadingPolicy
     */
    findContractById(contractId: string, isLoadingPolicy?: boolean): Promise<ContractInfo>;
    /**
     * 批量获取合约
     * @param contractIds
     * @param isLoadingPolicy
     */
    findContractByIds(contractIds: string[], isLoadingPolicy?: boolean): Promise<ContractInfo[]>;
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
     * @param licenseeIdentityType
     * @param subjectType
     * @param isWaitInitial
     */
    batchSignSubjects(subjects: BeSignSubjectOptions[], licenseeId: string | number, licenseeIdentityType: ContractLicenseeIdentityTypeEnum, subjectType: SubjectTypeEnum, isWaitInitial?: boolean): Promise<ContractInfo[]>;
    /**
     * 更新合同基础信息
     * @param {ContractInfo} contract
     * @param {UpdateContractBaseInfoOptions} options
     * @returns {Promise<boolean>}
     */
    updateContractInfo(contract: ContractInfo, options: any): Promise<boolean>;
    /**
     * 设置默认执行合同
     * @param {ContractInfo} contract
     * @returns {Promise<boolean>}
     */
    setDefaultExecContract(contract: ContractInfo): Promise<boolean>;
    findOne(condition: object, ...args: any[]): Promise<ContractInfo>;
    findById(contractId: string, ...args: any[]): Promise<ContractInfo>;
    find(condition: object, ...args: any[]): Promise<ContractInfo[]>;
    findByIds(contractIds: string[], ...args: any[]): Promise<ContractInfo[]>;
    findIntervalList(condition: object, skip?: number, limit?: number, projection?: string[], sort?: object): Promise<PageResult<ContractInfo>>;
    count(condition: object): Promise<number>;
    /**
     * 给资源填充策略详情信息
     * @param contracts
     * @param isTranslate
     */
    fillContractPolicyInfo(contracts: ContractInfo[], isTranslate?: boolean): Promise<ContractInfo[]>;
    /**
     * 获取签约数量
     * @param licenseeOwnerIds
     * @param licenseeIdentityType
     */
    findLicenseeSignCounts(licenseeOwnerIds: number[], licenseeIdentityType: ContractLicenseeIdentityTypeEnum): Promise<Array<{
        licensorOwnerId: number;
        count: number;
    }>>;
    /**
     * 查询合同流转记录
     * @param condition
     * @param projection
     * @param options
     */
    findContractTransitionRecords(condition: object, projection?: string, options?: object): Promise<ContractTransitionRecord[]>;
    /**
     * 分页查询合约流转记录
     * @param condition
     * @param skip
     * @param limit
     * @param projection
     * @param sort
     */
    findIntervalContractTransitionRecords(condition: object, skip?: number, limit?: number, projection?: string[], sort?: object): Promise<PageResult<ContractTransitionRecord>>;
    /**
     * 检查合同是否可以重签
     * @param baseInfos
     * @private
     */
    _checkIsCanReSignContracts(baseInfos: Array<{
        subjectId: string;
        subjectType: SubjectTypeEnum;
        licenseeId: string | number;
        policyId: string;
        status: number;
        contractId?: string;
    }>): Promise<any[]>;
    /**
     * 初始化合约
     * @param contracts
     * @param subjectPolicyMap
     */
    _initialContracts(contracts: ContractInfo[], subjectPolicyMap: Map<string, PolicyInfo>): Promise<void>;
}
