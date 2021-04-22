import {provide, inject, scope} from 'midway';
import {MongodbOperation} from 'egg-freelog-base';

@provide()
@scope('Singleton')
export default class ContractInvalidTransitionRecordProvider extends MongodbOperation<any> {
    constructor(@inject('model.ContractInvalidTransitionModel') model) {
        super(model);
    }
}
