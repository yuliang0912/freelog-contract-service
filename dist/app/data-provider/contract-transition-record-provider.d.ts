import { MongodbOperation } from 'egg-freelog-base';
import { ContractTransitionRecord } from '../../interface';
export default class ContractTransitionRecordProvider extends MongodbOperation<ContractTransitionRecord> {
    constructor(model: any);
}
