"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ContractInfoModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractInfoModel = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const mongoose_model_base_1 = require("./mongoose-model-base");
const enum_1 = require("../enum");
let ContractInfoModel = ContractInfoModel_1 = class ContractInfoModel extends mongoose_model_base_1.MongooseModelBase {
    buildMongooseModel() {
        /**
         * 合同信息,此次新版把策略信息提取出来放入contract-policy-info中存放.这样相同策略可以共用
         * 相比于旧版,此版本的策略减少了身份认证部分.调整成了签约限制.所以目前合约的授权只受状态机影响.
         * 所以合同中设置了合同是否授权的字段.当状态发生改变时,根据当前状态下的颜色集属性,重新计算授权结果.然后保存.
         */
        const contractInfoScheme = new this.mongoose.Schema({
            // contractCode: {type: String, required: false}, // 合同编号,目前还不需要此字段.
            contractName: { type: String, required: true },
            licensorId: { type: String, required: true },
            licensorName: { type: String, required: true },
            licensorOwnerId: { type: Number, required: true },
            licensorOwnerName: { type: String, required: true },
            licenseeId: { type: String, required: true },
            licenseeName: { type: String, required: true },
            licenseeOwnerId: { type: Number, required: true },
            licenseeOwnerName: { type: String, required: true },
            licenseeIdentityType: { type: Number, required: true },
            subjectId: { type: String, required: true },
            subjectName: { type: String, required: true },
            subjectType: { type: Number, required: true },
            policyId: { type: String, required: true },
            sortId: { type: Number, default: 0, required: true },
            signature: { type: String, required: true },
            uniqueKey: { type: String, required: true },
            fsmCurrentState: { type: String, default: null, required: false },
            fsmDeclarations: { type: this.mongoose.Schema.Types.Mixed, default: {}, required: false },
            fsmRunningStatus: { type: Number, default: 1, required: true },
            authStatus: { type: Number, default: 1, required: true },
            status: { type: Number, default: 0, required: true },
        }, {
            minimize: false,
            versionKey: false,
            timestamps: { createdAt: 'createDate', updatedAt: 'updateDate' },
            toJSON: ContractInfoModel_1.toObjectOptions,
            toObject: ContractInfoModel_1.toObjectOptions
        });
        contractInfoScheme.index({ licensorId: 1, licensorOwnerId: 1 });
        contractInfoScheme.index({ licenseeId: 1, licenseeOwnerId: 1 });
        contractInfoScheme.index({ subjectId: 1, subjectType: 1, policyId: 1 });
        contractInfoScheme.index({ uniqueKey: 1 }, { unique: true });
        contractInfoScheme.virtual('contractId').get(function () {
            return this.id;
        });
        contractInfoScheme.virtual('isDefault').get(function () {
            return lodash_1.isNumber(this.sortId) ? this.sortId === 1 : undefined;
        });
        contractInfoScheme.virtual('isAuth').get(function () {
            return lodash_1.isNumber(this.authStatus) ? (this.authStatus & enum_1.ContractAuthStatusEnum.Authorized) === enum_1.ContractAuthStatusEnum.Authorized : undefined;
        });
        contractInfoScheme.virtual('isTestAuth').get(function () {
            return lodash_1.isNumber(this.authStatus) ? (this.authStatus & enum_1.ContractAuthStatusEnum.TestNodeAuthorized) === enum_1.ContractAuthStatusEnum.TestNodeAuthorized : undefined;
        });
        return this.mongoose.model('contract-infos', contractInfoScheme);
    }
    static get toObjectOptions() {
        return {
            getters: true,
            virtuals: true,
            transform(doc, ret) {
                return lodash_1.assign({ contractId: doc.id }, lodash_1.omit(ret, ['_id', 'id', 'sortId', 'signature', 'uniqueKey', 'fsmDeclarations']));
            }
        };
    }
};
ContractInfoModel = ContractInfoModel_1 = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('model.ContractInfo')
], ContractInfoModel);
exports.ContractInfoModel = ContractInfoModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9jb250cmFjdC1pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxtQ0FBOEM7QUFDOUMsbUNBQXNDO0FBQ3RDLCtEQUE0RTtBQUM1RSxrQ0FBK0M7QUFJL0MsSUFBYSxpQkFBaUIseUJBQTlCLE1BQWEsaUJBQWtCLFNBQVEsdUNBQWlCO0lBRXBELGtCQUFrQjtRQUNkOzs7O1dBSUc7UUFDSCxNQUFNLGtCQUFrQixHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDaEQsb0VBQW9FO1lBQ3BFLFlBQVksRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUM1QyxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDMUMsWUFBWSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQzVDLGVBQWUsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUMvQyxpQkFBaUIsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUNqRCxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDMUMsWUFBWSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQzVDLGVBQWUsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUMvQyxpQkFBaUIsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUNqRCxvQkFBb0IsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUNwRCxTQUFTLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDekMsV0FBVyxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQzNDLFdBQVcsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUMzQyxRQUFRLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDeEMsTUFBTSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDbEQsU0FBUyxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQ3pDLFNBQVMsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUN6QyxlQUFlLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBQztZQUMvRCxlQUFlLEVBQUUsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUM7WUFDdkYsZ0JBQWdCLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUM1RCxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUN0RCxNQUFNLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztTQUVyRCxFQUFFO1lBQ0MsUUFBUSxFQUFFLEtBQUs7WUFDZixVQUFVLEVBQUUsS0FBSztZQUNqQixVQUFVLEVBQUUsRUFBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUM7WUFDOUQsTUFBTSxFQUFFLG1CQUFpQixDQUFDLGVBQWU7WUFDekMsUUFBUSxFQUFFLG1CQUFpQixDQUFDLGVBQWU7U0FDOUMsQ0FBQyxDQUFDO1FBRUgsa0JBQWtCLENBQUMsS0FBSyxDQUFDLEVBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxlQUFlLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQztRQUM5RCxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsRUFBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLGVBQWUsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQzlELGtCQUFrQixDQUFDLEtBQUssQ0FBQyxFQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQztRQUN0RSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsRUFBQyxTQUFTLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUV6RCxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQ3pDLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNuQixDQUFDLENBQUMsQ0FBQztRQUNILGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDeEMsT0FBTyxpQkFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNqRSxDQUFDLENBQUMsQ0FBQztRQUNILGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDckMsT0FBTyxpQkFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLDZCQUFzQixDQUFDLFVBQVUsQ0FBQyxLQUFLLDZCQUFzQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQy9JLENBQUMsQ0FBQyxDQUFDO1FBQ0gsa0JBQWtCLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUN6QyxPQUFPLGlCQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsNkJBQXNCLENBQUMsa0JBQWtCLENBQUMsS0FBSyw2QkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQy9KLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFFRCxNQUFNLEtBQUssZUFBZTtRQUN0QixPQUFPO1lBQ0gsT0FBTyxFQUFFLElBQUk7WUFDYixRQUFRLEVBQUUsSUFBSTtZQUNkLFNBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRztnQkFDZCxPQUFPLGVBQU0sQ0FBQyxFQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFDLEVBQUUsYUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekgsQ0FBQztTQUNKLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQTtBQXZFWSxpQkFBaUI7SUFGN0IsY0FBSyxDQUFDLFdBQVcsQ0FBQztJQUNsQixnQkFBTyxDQUFDLG9CQUFvQixDQUFDO0dBQ2pCLGlCQUFpQixDQXVFN0I7QUF2RVksOENBQWlCIn0=