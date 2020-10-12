import { ContractInfo, BeSignSubjectOptions, IContractService, IOutsideApiService, IContractEventHandler, IPolicyService, PageResult } from '../../interface';
import { IdentityType, SubjectType } from '../../enum';
export declare class ContractService implements IContractService {
    ctx: any;
    contractInfoProvider: any;
    policyService: IPolicyService;
    contractChangedHistoryProvider: any;
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
    batchSignSubjects(subjects: BeSignSubjectOptions[], licenseeId: string | number, licenseeIdentityType: IdentityType, subjectType: SubjectType): Promise<ContractInfo[]>;
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
    findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<PageResult<ContractInfo>>;
    count(condition: object): Promise<number>;
    addContractChangedHistory(contract: ContractInfo, fromState: string, toState: string, event: string, triggerDate: Date): Promise<any>;
    addContractChangedHistoryAndLockFsmRunningStatus(contract: ContractInfo, fromState: string, toState: string, event: string, triggerDate: Date): Promise<any>;
    /**
     * 给资源填充策略详情信息
     * @param resources
     */
    fillContractPolicyInfo(contracts: ContractInfo[]): Promise<ContractInfo[]>;
    /**
     * 检查合同是否可以重签
     * @param baseInfos
     * @private
     */
    _checkIsCanReSignContracts(baseInfos: Array<{
        subjectId: string;
        subjectType: SubjectType;
        licenseeId: string | number;
        policyId: string;
        status: number;
        contractId?: string;
    }>): Promise<any[]>;
}
