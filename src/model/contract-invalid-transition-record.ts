import {omit, assign} from 'lodash';
import {scope, provide, plugin} from 'midway';
import {MongooseModelBase} from 'egg-freelog-base/database/mongoose-model-base';

@scope('Singleton')
@provide('model.ContractInvalidTransitionModel')
export class ContractInvalidTransitionModel extends MongooseModelBase {

    constructor(@plugin('mongoose') mongoose) {
        super(mongoose);
    }

    buildMongooseModel() {

        const ContractInvalidTransitionSchema = new this.mongoose.Schema({
            contractId: {type: String, required: true},
            contractState: {type: String, required: true},
            eventId: {type: String, required: true},
            eventCode: {type: String, required: true},
            triggerDate: {type: Date, required: true},
            eventInfo: {type: this.mongoose.Schema.Types.Mixed, default: {}, required: false},
            remark: {type: String, required: false, default: ''}
        }, {
            versionKey: false,
            timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'},
            toJSON: ContractInvalidTransitionModel.toObjectOptions,
            toObject: ContractInvalidTransitionModel.toObjectOptions
        });

        return this.mongoose.model('contract-invalid-transition-records', ContractInvalidTransitionSchema);
    }

    static get toObjectOptions() {
        return {
            transform(doc, ret) {
                return assign({contractId: doc.id}, omit(ret, ['_id', 'id']));
            }
        };
    }
}
