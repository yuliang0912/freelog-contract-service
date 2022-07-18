import {provide, inject, scope} from 'midway';
import {MongodbOperation} from 'egg-freelog-base';

@provide()
@scope('Singleton')
export default class KafkaConsumeRecordProvider extends MongodbOperation<any> {
    constructor(@inject('model.KafkaConsumeRecord') model) {
        super(model);
    }
}
