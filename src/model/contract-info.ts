import {omit, assign, isUndefined, isNumber} from 'lodash';
import {scope, provide} from 'midway';
import {MongooseModelBase, IMongooseModelBase} from './mongoose-model-base';

@scope('Singleton')
@provide('model.ContractInfo')
export class ContractInfoModel extends MongooseModelBase implements IMongooseModelBase {

    buildMongooseModel() {
        /**
         * 合同信息,此次新版把策略信息提取出来放入contract-policy-info中存放.这样相同策略可以共用
         * 相比于旧版,此版本的策略减少了身份认证部分.调整成了签约限制.所以目前合约的授权只受状态机影响.
         * 所以合同中设置了合同是否授权的字段.当状态发生改变时,重新去对应的标的物服务重新获取一次授权结果.然后保存.
         * 授权服务在授权过程中,如果合同不是未知授权状态,则可以直接使用.否则还需要额外调用一次标的物服务实时获取授权结果.
         * 正常情况下,系统会在状态发生变更以后,第一时间进行再授权检查.避免调用方需要自行检查
         */
        const contractInfoScheme = new this.mongoose.Schema({
            // contractCode: {type: String, required: false}, // 合同编号,是否需要此字段,考虑中.
            contractName: {type: String, required: true},
            contractType: {type: Number, required: true},
            licensorId: {type: String, required: true}, // 甲方ID,例如资源ID
            licensorName: {type: String, required: true}, // 甲方名称,例如资源名称
            licensorOwnerId: {type: Number, required: true}, // 甲方所属人用户ID
            licensorOwnerName: {type: String, required: true}, // 甲方所属人用户名称
            licenseeId: {type: String, required: true}, // 乙方ID,例如资源ID,或者节点ID
            licenseeName: {type: String, required: true}, // 乙方名称,例如资源名,节点名称,消费者用户名
            licenseeOwnerId: {type: Number, required: true}, // 已方所属人用户ID
            licenseeOwnerName: {type: String, required: true}, // 已方所属人用户名称
            subjectId: {type: String, required: true}, // 标的物ID
            subjectName: {type: String, required: true}, // 标的物名称
            subjectType: {type: Number, required: true}, // 标的物类型
            policyId: {type: String, required: true}, // 标的物的策略ID
            sortId: {type: Number, default: 0, required: true}, // 排序ID,数字大的优先级别高,取代isDefault
            // 关键属性加密数据(contractId,licensorId,licensorOwnerId,licenseeId,licenseeOwnerId,subjectId,subjectType,policyId,createDate,currentFsmState)
            signature: {type: String, required: true},
            uniqueKey: {type: String, required: true}, // 唯一性key,由算法计算
            fsmCurrentState: {type: String, default: null, required: false}, // 状态机中当前的状态
            fsmDeclarations: {type: this.mongoose.Schema.Types.Mixed, default: {}, required: false}, // 状态机中相关的参数以及声明信息
            fsmRunningStatus: {type: Number, default: 1, required: true}, // 1:未初始化 2:系统锁住状态 4:生效中 8:已终止
            authStatus: {type: Number, default: 1, required: true}, // 1:未授权 2:正式授权 4:测试授权 8:未知
            status: {type: Number, default: 0, required: true}, // 0:正常 1:已终止(不接受任何事件,也不给授权,事实上无效的合约) 2:异常
            // remark: {type: String, required: true}, 备注牵扯到甲方备注和乙方备注. 需要具体了解需求,再做设计
        }, {
            minimize: false,
            versionKey: false,
            timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'},
            toJSON: ContractInfoModel.toObjectOptions,
            toObject: ContractInfoModel.toObjectOptions
        });

        contractInfoScheme.index({licensorId: 1, licensorOwnerId: 1});
        contractInfoScheme.index({licenseeId: 1, licenseeOwnerId: 1});
        contractInfoScheme.index({subjectId: 1, subjectType: 1, policyId: 1});
        contractInfoScheme.index({uniqueKey: 1}, {unique: true});

        contractInfoScheme.virtual('contractId').get(function (this: any) {
            return this.id;
        });
        contractInfoScheme.virtual('isDefault').get(function (this: any) {
            return isUndefined(this.sortId) ? undefined : this.sortId === 1;
        });
        contractInfoScheme.virtual('isAuth').get(function (this: any) {
            return isUndefined(this.authStatus) ? undefined : isNumber(this.authStatus) && (this.authStatus & 2) === 2;
        });
        contractInfoScheme.virtual('isTestAuth').get(function (this: any) {
            return isUndefined(this.authStatus) ? undefined : isNumber(this.authStatus) && (this.authStatus & 4) === 4;
        });
        contractInfoScheme.virtual('isPending').get(function (this: any) {
            return isUndefined(this.authStatus) ? undefined : isNumber(this.authStatus) && (this.authStatus & 8) === 8;
        });

        return this.mongoose.model('contract-infos', contractInfoScheme);
    }

    static get toObjectOptions() {
        return {
            getters: true,
            virtuals: true,
            transform(doc, ret) {
                return assign({contractId: doc.id}, omit(ret, ['_id', 'id', 'sortId', 'signature', 'uniqueKey', 'fsmDeclarations']));
            }
        };
    }
}
