import {provide, inject, scope} from 'midway';
import {MongodbOperation} from 'egg-freelog-base';

@provide()
@scope('Singleton')
export default class ContractChangedHistoryProvider extends MongodbOperation<any> {
    constructor(@inject('model.ContractChangedHistory') model) {
        super(model);
    }
}
