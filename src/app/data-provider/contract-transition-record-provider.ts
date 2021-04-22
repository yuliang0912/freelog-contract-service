import {provide, inject, scope} from 'midway';
import {MongodbOperation} from 'egg-freelog-base';
import {ContractTransitionRecord} from '../../interface';

@provide()
@scope('Singleton')
export default class ContractTransitionRecordProvider extends MongodbOperation<ContractTransitionRecord> {
    constructor(@inject('model.ContractTransitionRecord') model) {
        super(model);
    }
}
