import {IContractEventHandler, IEventHandler} from '../../interface';
import {ApplicationError} from 'egg-freelog-base';
import {provide, scope, init, inject} from 'midway';
import {ContractEventEnum} from '../../enum';

@scope('Singleton')
@provide('contractEventHandler')
export class ContractEventHandler implements IContractEventHandler {

    @inject()
    initialContractEventHandler: IEventHandler;

    readonly contractEventHandlerMap: Map<ContractEventEnum, IEventHandler> = new Map();

    async handle(eventEnum: ContractEventEnum, ...args): Promise<any> {
        if (!this.contractEventHandlerMap.has(eventEnum)) {
            throw new ApplicationError(`${eventEnum} even handler is not implement`);
        }
        return this.contractEventHandlerMap.get(eventEnum).handle(...args);
    }

    @init()
    initialEventHandler() {
        this.contractEventHandlerMap.set(ContractEventEnum.InitialContractFsmEvent, this.initialContractEventHandler);
    }
}
