import { ContractInfo, PolicyInfo, IEventHandler, IPolicyService, IContractService } from '../../interface';
export declare class InitialContractEventHandler implements IEventHandler {
    private _queue;
    readonly MAX_QUEUE_TASK_COUNT = 50;
    contractFsmGenerator: any;
    policyService: IPolicyService;
    contractService: IContractService;
    get taskQueue(): any;
    /**
     * TODO: 1.对合同实例化时的参数进行解析并且赋值,保存到contractInfo.fsmDeclarations中
     * TODO: 2.分析出状态机中描述信息中的初始态名称,并且赋值.
     * TODO: 3.把合同转换成状态机.然后后续的事件处理,由统一的状态机事件系统介入.
     * TODO: 后续服务需要提供定时JOB,用于扫描状态为Uninitialized或InitializedError的合约.然后对其初始化,防止部分合约初始化失败.
     */
    handle(contractInfos: ContractInfo[]): Promise<void>;
    _initialContract(contract: {
        contractInfo: ContractInfo;
        policyInfo: PolicyInfo;
    }): Promise<void>;
    /**
     * 初始化错误处理
     * @param error
     * @returns {Promise<void>}
     * @private
     */
    _callback(this: any, error: any): void;
}
