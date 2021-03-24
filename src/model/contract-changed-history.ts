import {omit, assign} from 'lodash';
import {scope, provide, plugin} from 'midway';
import {MongooseModelBase} from 'egg-freelog-base/database/mongoose-model-base';

@scope('Singleton')
@provide('model.ContractChangedHistory')
export class ContractChangedHistoryModel extends MongooseModelBase {

    constructor(@plugin('mongoose') mongoose) {
        super(mongoose);
    }

    buildMongooseModel() {
        const EventRecordSchema = new this.mongoose.Schema({
            fromState: {type: String, required: true},
            toState: {type: String, required: true},
            eventId: {type: String, required: true},
            triggerDate: {type: Date, required: true},
            createDate: {type: Date, required: true}
        }, {_id: false});

        const contractChangedHistorySchema = new this.mongoose.Schema({
            // _id: {type: this.mongoose.Schema.ObjectId, required: true}, // 外键,来源于合同ID
            contractId: {type: String, required: true},
            histories: {type: [EventRecordSchema], required: true},
        }, {
            versionKey: false,
            timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'},
            toJSON: ContractChangedHistoryModel.toObjectOptions,
            toObject: ContractChangedHistoryModel.toObjectOptions
        });

        contractChangedHistorySchema.index({contractId: 1}, {unique: true});

        return this.mongoose.model('contract-changed-histories', contractChangedHistorySchema);
    }

    static get toObjectOptions() {
        return {
            transform(doc, ret) {
                return assign({contractId: doc.id}, omit(ret, ['_id', 'id']));
            }
        };
    }
}
