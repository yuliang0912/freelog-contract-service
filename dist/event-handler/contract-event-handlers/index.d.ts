import { IContractEventHandler, IEventHandler } from '../../interface';
import { ContractEventEnum } from '../../enum';
export declare class ContractEventHandler implements IContractEventHandler {
    initialContractEventHandler: IEventHandler;
    setAuthStatusEventHandler: IEventHandler;
    readonly contractEventHandlerMap: Map<ContractEventEnum, IEventHandler>;
    handle(eventEnum: ContractEventEnum, ...args: any[]): Promise<any>;
    initialEventHandler(): void;
}
