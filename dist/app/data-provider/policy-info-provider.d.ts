import { MongodbOperation } from 'egg-freelog-base';
import { PolicyInfo } from '../../interface';
export default class PolicyInfoProvider extends MongodbOperation<PolicyInfo> {
    constructor(model: any);
}
