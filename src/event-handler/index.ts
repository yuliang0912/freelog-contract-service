import {IEventHandler} from '../interface';
import {ApplicationError} from 'egg-freelog-base';
import {provide, scope, init, inject} from 'midway';
import {ContractEventEnum, ContractFsmEventEnum, OutsideServiceEventEnum} from '../enum';

@scope('Singleton')
@provide('contractEventHandler')
export class ContractEventHandler {

    @inject()
    initialContractEventHandler: IEventHandler;
    @inject()
    contractFsmStateTransitionHandler: IEventHandler;

    readonly contractEventHandlerMap: Map<ContractEventEnum, IEventHandler> = new Map();
    readonly contractFsmEventHandlerMap: Map<ContractFsmEventEnum, IEventHandler> = new Map();
    readonly outsideServiceEventHandlerMap: Map<OutsideServiceEventEnum, IEventHandler> = new Map();

    async emitContractEvent(eventEnum: ContractEventEnum, ...args): Promise<any> {
        return this._execEventHandle(this.contractEventHandlerMap, eventEnum, ...args);
    }

    async emitContractFsmEventHandle(eventEnum: ContractFsmEventEnum, ...args): Promise<any> {
        return this._execEventHandle(this.contractFsmEventHandlerMap, eventEnum, ...args);
    }

    async emitOutsideServiceEventHandle(eventEnum: OutsideServiceEventEnum, ...args): Promise<any> {
        return this._execEventHandle(this.outsideServiceEventHandlerMap, eventEnum, ...args);
    }

    _execEventHandle(handleMap: Map<any, IEventHandler>, eventEnum, ...args) {
        if (!handleMap.has(eventEnum)) {
            throw new ApplicationError(`${eventEnum} even handler is not implement`);
        }
        return handleMap.get(eventEnum).handle(...args);
    }

    @init()
    initialEventHandler() {
        this.contractEventHandlerMap.set(ContractEventEnum.InitialContractFsmEvent, this.initialContractEventHandler);
        this.contractFsmEventHandlerMap.set(ContractFsmEventEnum.FsmStateTransition, this.contractFsmStateTransitionHandler);
    }
}
