import {provide, scope} from 'midway';
import {IEventHandler} from '../../interface';

@scope('Singleton')
@provide('fsmEventRegisteredEventHandler')
export class FsmEventRegisteredEventHandler implements IEventHandler {

    async handle() {
        return null;
    }
}
