import {ApplicationError} from 'egg-freelog-base';
import {provide, scope, init, inject} from 'midway';
import {ContractFsmEventEnum} from '../../enum';
import {IContractFsmEventHandler, IEventHandler} from '../../interface';

@scope('Singleton')
@provide('contractFsmEventHandler')
export class ContractFsmEventHandler implements IContractFsmEventHandler {

    @inject()
    contractFsmStateTransitionHandler: IEventHandler;

    readonly contractEventHandlerMap: Map<ContractFsmEventEnum, IEventHandler> = new Map();

    async handle(eventEnum: ContractFsmEventEnum, ...args): Promise<any> {
        if (!this.contractEventHandlerMap.has(eventEnum)) {
            throw new ApplicationError(`${eventEnum} even handler is not implement`);
        }
        return this.contractEventHandlerMap.get(eventEnum).handle(...args);
    }

    @init()
    initialEventHandler() {
        this.contractEventHandlerMap.set(ContractFsmEventEnum.FsmStateTransition, this.contractFsmStateTransitionHandler);
    }
}
