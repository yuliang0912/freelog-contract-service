import { ContractInfo } from '../interface';
import { OutsideApiService } from '../app/service/outside-api-service';
export declare class ContractEnvironmentVariableHandler {
    outsideApiService: OutsideApiService;
    constructor(app: any);
    /**
     * 初始化全局环境变量
     */
    initialStaticEnvironmentVariable(contractInfo: ContractInfo): Promise<void>;
    /**
     * 获取个人交易账号
     * @param ownerId
     */
    getIndividualTransactionAccounts(ownerId: number): Promise<any>;
    /**
     * 获取合约环境变量
     * @param contractInfo
     * @param name
     */
    getEnvironmentVariable(contractInfo: ContractInfo, name: string): Promise<any>;
    /**
     * 是否存在环境变量
     * @param name
     */
    isIncludesEnvironmentVariable(name: string): boolean;
    /**
     * 是否包含静态环境变量(静态环境变量初始化之后就不在变更)
     * @param name
     */
    isIncludesStaticEnvironmentVariable(name: string): boolean;
    /**
     * 获取全局环境变量
     */
    static get StaticEnvironmentVariables(): string[];
}
