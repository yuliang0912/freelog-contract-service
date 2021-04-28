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
     * 获取全局环境变量
     */
    static get StaticEnvironmentVariables(): string[];
}
