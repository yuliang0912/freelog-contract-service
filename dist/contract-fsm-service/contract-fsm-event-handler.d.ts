import { ContractAuthStatusEnum, ContractFsmRunningStatusEnum } from '../enum';
import { ContractInfo, ContractTransitionRecord, IContractTriggerEventMessage } from '../interface';
import { IMongodbOperation } from 'egg-freelog-base';
import { ClientSession } from 'mongoose';
import { ContractEnvironmentVariableHandler } from '../extend/contract-environment-variable-handler';
export declare class ContractFsmEventHandler {
    mongoose: any;
    contractInfoProvider: IMongodbOperation<ContractInfo>;
    contractTransitionRecordProvider: IMongodbOperation<ContractTransitionRecord>;
    contractEnvironmentVariableHandler: ContractEnvironmentVariableHandler;
    /**
     * 同步订单状态,并且记录订单变更历史
     * 1.同步合同的授权状态
     * 2.同步状态机的运行状态描述
     * 3.同步状态机的实际执行状态
     * 4.记录状态机变更历史记录
     * @param contractInfo
     * @param session
     * @param eventInfo
     * @param transition
     * @param fromState
     * @param toState
     */
    syncOrderStateAndChangedHistory(contractInfo: ContractInfo, session: ClientSession, eventInfo: IContractTriggerEventMessage, transition: string, fromState: string, toState: string): Promise<any>;
    /**
     * 合约初始化错误处理
     * @param contractInfo
     * @param eventInfo
     * @param errorMsg
     */
    contractInitialErrorHandle(contractInfo: ContractInfo, eventInfo: IContractTriggerEventMessage, errorMsg: string): Promise<{
        n: number;
        nModified: number;
        ok: number;
    }>;
    /**
     * 合约授权状态发生转变事件处理
     * @param contractInfo
     * @param afterAuthStatus
     */
    execAuthStatusChangedEventHandle(contractInfo: ContractInfo, afterAuthStatus: ContractAuthStatusEnum): Promise<void>;
    /**
     * 获取合同的授权状态
     * @param contractInfo
     * @param toState
     * @constructor
     */
    static GetContractAuthStatus(contractInfo: ContractInfo, toState: string): number;
    /**
     * 获取合约的运行状态
     * @param contractInfo
     * @param toState
     * @constructor
     */
    static GetContractFsmRunningStatus(contractInfo: ContractInfo, toState: string): ContractFsmRunningStatusEnum;
}
