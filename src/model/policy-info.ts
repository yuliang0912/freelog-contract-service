import {scope, provide} from 'midway';
import {omit} from 'lodash';
import {MongooseModelBase, IMongooseModelBase} from './mongoose-model-base';

@scope('Singleton')
@provide('model.PolicyInfo')
export class PolicyInfoModel extends MongooseModelBase implements IMongooseModelBase {

    buildMongooseModel() {

        /**
         * 合同服务同时负责保存整个平台的策略信息.对于策略中存在多样性的策略名称,是否启动等信息,则直接由具体的标的物服务自行保存
         * 整个平台相同的策略会根据一定的算法计算.仅保留一份.
         */
        const contractPolicyInfoScheme = new this.mongoose.Schema({
            userId: {type: Number, required: true},
            policyId: {type: String, required: true},
            policyName: {type: String, required: true},
            policyText: {type: String, required: true},
            subjectType: {type: String, required: true},
            fsmDescriptionInfo: {type: this.mongoose.Schema.Types.Mixed, required: true},
            status: {type: Number, default: 0, required: true},
        }, {
            versionKey: false,
            timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'},
            toJSON: PolicyInfoModel.toObjectOptions,
            toObject: PolicyInfoModel.toObjectOptions
        });

        contractPolicyInfoScheme.index({policyId: 1}, {unique: true});

        return this.mongoose.model('subject-policy-infos', contractPolicyInfoScheme);
    }

    static get toObjectOptions() {
        return {
            transform(doc, ret) {
                return omit(ret, ['_id', 'id']);
            }
        };
    }
}
