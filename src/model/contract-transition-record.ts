import {omit, assign} from 'lodash';
import {scope, provide, plugin} from 'midway';
import {MongooseModelBase} from 'egg-freelog-base/database/mongoose-model-base';

@scope('Singleton')
@provide('model.ContractTransitionRecord')
export class ContractTransitionRecordModel extends MongooseModelBase {

    constructor(@plugin('mongoose') mongoose) {
        super(mongoose);
    }

    buildMongooseModel() {
        const contractTransitionRecordSchema = new this.mongoose.Schema({
            contractId: {type: String, required: true},
            eventId: {type: String, required: true},
            fromState: {type: String, required: true},
            toState: {type: String, required: true},
            eventInfo: {type: this.mongoose.Schema.Types.Mixed, required: true},
        }, {
            versionKey: false,
            timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'},
            toJSON: ContractTransitionRecordModel.toObjectOptions,
            toObject: ContractTransitionRecordModel.toObjectOptions
        });

        contractTransitionRecordSchema.index({contract: 1});

        contractTransitionRecordSchema.virtual('stateId').get(function (this: any) {
            return this.id;
        });

        return this.mongoose.model('contract-transition-records', contractTransitionRecordSchema);
    }

    static get toObjectOptions() {
        return {
            transform(doc, ret) {
                return assign({contractId: doc.id}, omit(ret, ['_id', 'id']));
            }
        };
    }
}
