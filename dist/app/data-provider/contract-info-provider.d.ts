import { MongodbOperation } from 'egg-freelog-base';
import { ContractInfo } from '../../interface';
export default class ContractInfoProvider extends MongodbOperation<ContractInfo> {
    constructor(model: any);
}
