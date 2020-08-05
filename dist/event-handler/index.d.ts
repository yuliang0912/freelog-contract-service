import { ContractEventEnum, ContractFsmEventEnum, OutsideServiceEventEnum } from '../enum';
import { ICommonEventHandler, IContractEventHandler, IContractFsmEventHandler, IOutsideServiceEventHandler } from '../interface';
export declare class ContractEventHandler implements ICommonEventHandler {
    contractEventHandler: IContractEventHandler;
    contractFsmEventHandler: IContractFsmEventHandler;
    outsideServiceEventHandler: IOutsideServiceEventHandler;
    /**
     * 触发合同事件
     * @param {ContractEventEnum} eventEnum
     * @param args
     * @returns {Promise<any>}
     */
    contractEventHandle(eventEnum: ContractEventEnum, ...args: any[]): Promise<any>;
    /**
     * 触发合同状态机事件
     * @param {ContractFsmEventEnum} eventEnum
     * @param args
     * @returns {Promise<any>}
     */
    contractFsmEventHandle(eventEnum: ContractFsmEventEnum, ...args: any[]): Promise<any>;
    /**
     * 触发接收到外部服务事件
     * @param {OutsideServiceEventEnum} eventEnum
     * @param args
     * @returns {Promise<any>}
     */
    outsideServiceEventHandle(eventEnum: OutsideServiceEventEnum, ...args: any[]): Promise<any>;
}
