import {provide, inject, scope} from 'midway';
import {MongodbOperation} from 'egg-freelog-base';
import {ContractInfo} from '../../interface';

@provide()
@scope('Singleton')
export default class ContractInfoProvider extends MongodbOperation<ContractInfo> {
    constructor(@inject('model.ContractInfo') model) {
        super(model);
    }
}
