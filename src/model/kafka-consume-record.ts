import {scope, provide, plugin} from 'midway';
import {MongooseModelBase} from 'egg-freelog-base/database/mongoose-model-base';

@scope('Singleton')
@provide('model.KafkaConsumeRecord')
export class KafkaConsumeRecord extends MongooseModelBase {

    constructor(@plugin('mongoose') mongoose) {
        super(mongoose);
    }

    buildMongooseModel() {
        const KafkaConsumeRecordScheme = new this.mongoose.Schema({
            consumer: {type: String, required: true},
            topic: {type: String, required: true},
            partition: {type: Number, required: true},
            offset: {type: Number, required: true},
            messageKey: {type: String, default: '', required: false},
            messageTimestamp: {type: Number, required: true},
            messageValue: {}
        }, {
            versionKey: false,
            timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'}
        });

        return this.mongoose.model('kafka-consume-records', KafkaConsumeRecordScheme);
    }
}
