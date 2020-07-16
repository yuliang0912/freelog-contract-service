import {provide, scope, inject} from 'midway';
import {ContractEventEnum, ContractFsmEventEnum, OutsideServiceEventEnum} from '../enum';
import {
    ICommonEventHandler, IContractEventHandler, IContractFsmEventHandler, IOutsideServiceEventHandler
} from '../interface';

@scope('Singleton')
@provide('commonEventHandler')
export class ContractEventHandler implements ICommonEventHandler {

    @inject()
    contractEventHandler: IContractEventHandler;
    @inject()
    contractFsmEventHandler: IContractFsmEventHandler;
    @inject()
    outsideServiceEventHandler: IOutsideServiceEventHandler;

    /**
     * 触发合同事件
     * @param {ContractEventEnum} eventEnum
     * @param args
     * @returns {Promise<any>}
     */
    async contractEventHandle(eventEnum: ContractEventEnum, ...args): Promise<any> {
        return this.contractEventHandler.handle(eventEnum, ...args);
    }

    /**
     * 触发合同状态机事件
     * @param {ContractFsmEventEnum} eventEnum
     * @param args
     * @returns {Promise<any>}
     */
    async contractFsmEventHandle(eventEnum: ContractFsmEventEnum, ...args): Promise<any> {
        return this.contractFsmEventHandler.handle(eventEnum, ...args);
    }

    /**
     * 触发接收到外部服务事件
     * @param {OutsideServiceEventEnum} eventEnum
     * @param args
     * @returns {Promise<any>}
     */
    async outsideServiceEventHandle(eventEnum: OutsideServiceEventEnum, ...args): Promise<any> {
        return this.outsideServiceEventHandler.handle(eventEnum, ...args);
    }
}
