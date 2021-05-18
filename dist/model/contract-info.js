"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ContractInfoModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractInfoModel = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const mongoose_model_base_1 = require("egg-freelog-base/database/mongoose-model-base");
const enum_1 = require("../enum");
let ContractInfoModel = ContractInfoModel_1 = class ContractInfoModel extends mongoose_model_base_1.MongooseModelBase {
    constructor(mongoose) {
        super(mongoose);
    }
    buildMongooseModel() {
        /**
         * 合同信息,此次新版把策略信息提取出来放入contract-policy-info中存放.这样相同策略可以共用
         * 相比于旧版,此版本的策略减少了身份认证部分.调整成了签约限制.所以目前合约的授权只受状态机影响.
         * 所以合同中设置了合同是否授权的字段.当状态发生改变时,根据当前状态下的颜色集属性,重新计算授权结果.然后保存.
         */
        const contractInfoSchema = new this.mongoose.Schema({
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
        contractInfoSchema.index({ licensorId: 1, licensorOwnerId: 1 });
        contractInfoSchema.index({ licenseeId: 1, licenseeOwnerId: 1 });
        contractInfoSchema.index({ subjectId: 1, subjectType: 1, policyId: 1 });
        contractInfoSchema.index({ uniqueKey: 1 }, { unique: true });
        contractInfoSchema.virtual('contractId').get(function () {
            return this.id;
        });
        contractInfoSchema.virtual('isDefault').get(function () {
            return lodash_1.isNumber(this.sortId) ? this.sortId === 1 : undefined;
        });
        contractInfoSchema.virtual('isAuth').get(function () {
            return lodash_1.isNumber(this.authStatus) ? (this.authStatus & enum_1.ContractAuthStatusEnum.Authorized) === enum_1.ContractAuthStatusEnum.Authorized : undefined;
        });
        contractInfoSchema.virtual('isTestAuth').get(function () {
            return lodash_1.isNumber(this.authStatus) ? (this.authStatus & enum_1.ContractAuthStatusEnum.TestNodeAuthorized) === enum_1.ContractAuthStatusEnum.TestNodeAuthorized : undefined;
        });
        return this.mongoose.model('contract-infos', contractInfoSchema);
    }
    static get toObjectOptions() {
        return {
            getters: true,
            virtuals: true,
            transform(doc, ret) {
                return lodash_1.assign({ contractId: doc.id }, lodash_1.omit(ret, ['_id', 'id', 'sortId', 'signature', 'uniqueKey']));
            }
        };
    }
};
ContractInfoModel = ContractInfoModel_1 = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('model.ContractInfo'),
    __param(0, midway_1.plugin('mongoose')),
    __metadata("design:paramtypes", [Object])
], ContractInfoModel);
exports.ContractInfoModel = ContractInfoModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9jb250cmFjdC1pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBOEM7QUFDOUMsbUNBQThDO0FBQzlDLHVGQUFnRjtBQUNoRixrQ0FBK0M7QUFJL0MsSUFBYSxpQkFBaUIseUJBQTlCLE1BQWEsaUJBQWtCLFNBQVEsdUNBQWlCO0lBRXBELFlBQWdDLFFBQVE7UUFDcEMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3BCLENBQUM7SUFFRCxrQkFBa0I7UUFDZDs7OztXQUlHO1FBQ0gsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQ2hELG9FQUFvRTtZQUNwRSxZQUFZLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDNUMsVUFBVSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQzFDLFlBQVksRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUM1QyxlQUFlLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDL0MsaUJBQWlCLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDakQsVUFBVSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQzFDLFlBQVksRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUM1QyxlQUFlLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDL0MsaUJBQWlCLEVB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