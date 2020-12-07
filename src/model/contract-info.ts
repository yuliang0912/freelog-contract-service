import {omit, assign, isNumber} from 'lodash';
import {scope, provide} from 'midway';
import {MongooseModelBase} from './mongoose-model-base';
import {ContractAuthStatusEnum} from '../enum';

@scope('Singleton')
@provide('model.ContractInfo')
export class ContractInfoModel extends MongooseModelBase {

    buildMongooseModel() {
        /**
         * 合同信息,此次新版把策略信息提取出来放入contract-policy-info中存放.这样相同策略可以共用
         * 相比于旧版,此版本的策略减少了身份认证部分.调整成了签约限制.所以目前合约的授权只受状态机影响.
         * 所以合同中设置了合同是否授权的字段.当状态发生改变时,根据当前状态下的颜色集属性,重新计算授权结果.然后保存.
         */
        const contractInfoScheme = new this.mongoose.Schema({
            // contractCode: {type: String, required: false}, // 合同编号,目前还不需要此字段.
            contractName: {type: String, required: true},
            licensorId: {type: String, required: true}, // 甲方ID,例如资源ID或者节点ID
            licensorName: {type: String, required: true}, // 甲方名称,例如资源名称或者节点名称
            licensorOwnerId: {type: Number, required: true}, // 甲方所属人用户ID
            licensorOwnerName: {type: String, required: true}, // 甲方所属人用户名称
            licenseeId: {type: String, required: true}, // 乙方ID,例如资源ID,或者节点ID或者用户ID
            licenseeName: {type: String, required: true}, // 乙方名称,例如资源名,节点名称,消费者用户名
            licenseeOwnerId: {type: Number, required: true}, // 已方所属人用户ID
            licenseeOwnerName: {type: String, required: true}, // 已方所属人用户名称
            licenseeIdentityType: {type: Number, required: true}, // 乙方身份类型(1:资源方,2:节点方 3:C端用户方),取代contractType
            subjectId: {type: String, required: true}, // 标的物ID,例如资源ID,展品ID
            subjectName: {type: String, required: true}, // 标的物名称
            subjectType: {type: Number, required: true}, // 标的物类型
            policyId: {type: String, required: true}, // 标的物的策略ID
            sortId: {type: Number, default: 0, required: true}, // 排序ID,数字大的优先级别高,取代isDefault,目前为兼容模式 1:默认 0:非默认
            signature: {type: String, required: true}, // 具体加密算法以及字段详见代码:extend/contract-common-generator/contract-info-signature-generator.ts
            uniqueKey: {type: String, required: true}, // 具体加密算法以及字段详见代码:extend/contract-common-generator/contract-info-signature-generator.ts
            fsmCurrentState: {type: String, default: null, required: false}, // 状态机中当前的状态
            fsmDeclarations: {type: this.mongoose.Schema.Types.Mixed, default: {}, required: false}, // 状态机中相关的参数以及声明信息
            fsmRunningStatus: {type: Number, default: 1, required: true}, // 状态机运行状态 1:未初始化 2:系统锁定状态 4:生效中(已初始化,未终止) 8:已终止
            authStatus: {type: Number, default: 1, required: true}, // 合同授权状态: 参考ContractAuthStatusEnum
            status: {type: Number, default: 0, required: true}, // 合同状态 0:正常 1:已终止(不接受任何事件,也不给授权,事实上无效的合约) 2:异常
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
            return isNumber(this.sortId) ? this.sortId === 1 : undefined;
        });
        contractInfoScheme.virtual('isAuth').get(function (this: any) {
            return isNumber(this.authStatus) ? (this.authStatus & ContractAuthStatusEnum.Authorized) === ContractAuthStatusEnum.Authorized : undefined;
        });
        contractInfoScheme.virtual('isTestAuth').get(function (this: any) {
            return isNumber(this.authStatus) ? (this.authStatus & ContractAuthStatusEnum.TestNodeAuthorized) === ContractAuthStatusEnum.TestNodeAuthorized : undefined;
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
