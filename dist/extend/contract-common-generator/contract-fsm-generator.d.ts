import { ContractInfo, PolicyInfo, IContractFsmEventHandler } from '../../interface';
export declare class ContractFsmGenerator {
    contractStateMachineBuilder: any;
    contractFsmEventHandler: IContractFsmEventHandler;
    /**
     * 合同转换为可执行的状态机
     * @param {ContractInfo} contractInfo
     * @param {ContractPolicyInfo} contractPolicyInfo
     * @returns {any}
     */
    contractWarpToFsm(contractInfo: ContractInfo, contractPolicyInfo: PolicyInfo): any;
    /**
     * 是否可以执行指定的事件
     * @param {ContractInfo} contractInfo
     * @param {ContractPolicyInfo} contractPolicyInfo
     * @param {string} eventId
     * @returns {boolean}
     */
    isCanExecEvent(contractInfo: ContractInfo, contractPolicyInfo: PolicyInfo, eventId: string): boolean;
    _onEnterStateEventHandle(fsmDescriptionInfo: object): (lifeCycle: any, ...args: any[]) => void;
}
