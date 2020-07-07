import {omit, assign} from 'lodash';
import {scope, provide} from 'midway';
import {MongooseModelBase, IMongooseModelBase} from './mongoose-model-base';

@scope('Singleton')
@provide('model.ContractChangedHistory')
export class ContractChangedHistoryModel extends MongooseModelBase implements IMongooseModelBase {

    buildMongooseModel() {

        const contractChangedHistoryScheme = new this.mongoose.Schema({
            // _id: {type: this.mongoose.Schema.ObjectId, required: true}, // 外键,来源于合同ID
            contractId: {type: String, required: true},
            histories: {type: Array, required: true},
        }, {
            versionKey: false,
            timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'},
            toJSON: ContractChangedHistoryModel.toObjectOptions,
            toObject: ContractChangedHistoryModel.toObjectOptions
        });

        // contractChangedHistoryScheme.virtual('contractId').get(function (this: any) {
        //     return this.id;
        // });

        return this.mongoose.model('contract-changed-histories', contractChangedHistoryScheme);
    }

    static get toObjectOptions() {
        return {
            transform(doc, ret) {
                return assign({contractId: doc.id}, omit(ret, ['_id', 'id']));
            }
        };
    }
}
