import { ContractFsmEventEnum } from '../../enum';
import { IContractFsmEventHandler, IEventHandler } from '../../interface';
export declare class ContractFsmEventHandler implements IContractFsmEventHandler {
    contractFsmStateTransitionHandler: IEventHandler;
    readonly contractEventHandlerMap: Map<ContractFsmEventEnum, IEventHandler>;
    handle(eventEnum: ContractFsmEventEnum, ...args: any[]): Promise<any>;
    initialEventHandler(): void;
}
