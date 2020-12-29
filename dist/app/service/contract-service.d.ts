import { ContractInfo, BeSignSubjectOptions, IContractService, IOutsideApiService, IContractEventHandler, IPolicyService } from '../../interface';
import { FreelogContext, ContractLicenseeIdentityTypeEnum, SubjectTypeEnum, PageResult, IMongodbOperation } from 'egg-freelog-base';
export declare class ContractService implements IContractService {
    mongoose: any;
    ctx: FreelogContext;
    contractInfoProvider: IMongodbOperation<ContractInfo>;
    policyService: IPolicyService;
    contractChangedHistoryProvider: IMongodbOperation<any>;
    contractInfoSignatureProvider: any;
    outsideApiService: IOutsideApiService;
    contractEventHandler: IContractEventHandler;
    /**
     * 批量签约标的物
     * @param subjects
     * @param licenseeId
     * @param licenseeIdentityType
     * @param subjectType
     */
    batchSignSubjects(subjects: BeSignSubjectOptions[], licenseeId: string | number, licenseeIdentityType: ContractLicenseeIdentityTypeEnum, subjectType: SubjectTypeEnum): Promise<ContractInfo[]>;
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
    addContractChangedHistory(contract: ContractInfo, fromState: string, toState: string, event: string, triggerDate: Date): Promise<any>;
    addContractChangedHistoryAndLockFsmRunningStatus(contract: ContractInfo, fromState: string, toState: string, event: string, triggerDate: Date): Promise<{
        n: number;
        nModified: number;
        ok: number;
    }>;
    /**
     * 给资源填充策略详情信息
     * @param resources
     */
    fillContractPolicyInfo(contracts: ContractInfo[]): Promise<ContractInfo[]>;
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
}
