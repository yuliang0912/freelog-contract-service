import { IEventHandler, IOutsideServiceEventHandler } from '../../interface';
import { OutsideServiceEventEnum } from '../../enum';
export declare class OutsideServiceEventHandler implements IOutsideServiceEventHandler {
    readonly contractEventHandlerMap: Map<OutsideServiceEventEnum, IEventHandler>;
    handle(eventEnum: OutsideServiceEventEnum, ...args: any[]): Promise<any>;
    initialEventHandler(): void;
}
