import {provide, inject, scope} from 'midway';
import {MongodbOperation} from 'egg-freelog-base';
import {PolicyInfo} from '../../interface';

@provide()
@scope('Singleton')
export default class PolicyInfoProvider extends MongodbOperation<PolicyInfo> {
    constructor(@inject('model.PolicyInfo') model) {
        super(model);
    }
}
