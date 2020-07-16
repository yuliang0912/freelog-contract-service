import {IEventHandler, IOutsideServiceEventHandler} from '../../interface';
import {ApplicationError} from 'egg-freelog-base';
import {provide, scope, init} from 'midway';
import {OutsideServiceEventEnum} from '../../enum';

@scope('Singleton')
@provide('outsideServiceEventHandler')
export class OutsideServiceEventHandler implements IOutsideServiceEventHandler {

    readonly contractEventHandlerMap: Map<OutsideServiceEventEnum, IEventHandler> = new Map();

    async handle(eventEnum: OutsideServiceEventEnum, ...args): Promise<any> {
        if (!this.contractEventHandlerMap.has(eventEnum)) {
            throw new ApplicationError(`${eventEnum} even handler is not implement`);
        }
        return this.contractEventHandlerMap.get(eventEnum).handle(...args);
    }

    @init()
    initialEventHandler() {
        // this.contractEventHandlerMap.set(OutsideServiceEventEnum.RegisterCompletedEvent, this.contractFsmStateTransitionHandler);
    }
}
