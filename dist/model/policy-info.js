"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PolicyInfoModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyInfoModel = void 0;
const midway_1 = require("midway");
const lodash_1 = require("lodash");
const mongoose_model_base_1 = require("./mongoose-model-base");
let PolicyInfoModel = PolicyInfoModel_1 = class PolicyInfoModel extends mongoose_model_base_1.MongooseModelBase {
    buildMongooseModel() {
        /**
         * 合同服务同时负责保存整个平台的策略信息.对于策略中存在多样性的策略名称,是否启动等信息,则直接由具体的标的物服务自行保存
         * 整个平台相同的策略会根据一定的算法计算.仅保留一份.
         */
        const contractPolicyInfoScheme = new this.mongoose.Schema({
            userId: { type: Number, required: true },
            policyId: { type: String, required: true },
            policyName: { type: String, required: true },
            policyText: { type: String, required: true },
            subjectType: { type: String, required: true },
            fsmDescriptionInfo: { type: this.mongoose.Schema.Types.Mixed, required: true },
            status: { type: Number, default: 0, required: true },
        }, {
            versionKey: false,
            timestamps: { createdAt: 'createDate', updatedAt: 'updateDate' },
            toJSON: PolicyInfoModel_1.toObjectOptions,
            toObject: PolicyInfoModel_1.toObjectOptions
        });
        contractPolicyInfoScheme.index({ policyId: 1 }, { unique: true });
        return this.mongoose.model('subject-policy-infos', contractPolicyInfoScheme);
    }
    static get toObjectOptions() {
        return {
            transform(doc, ret) {
                return lodash_1.omit(ret, ['_id', 'id']);
            }
        };
    }
};
PolicyInfoModel = PolicyInfoModel_1 = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('model.PolicyInfo')
], PolicyInfoModel);
exports.PolicyInfoModel = PolicyInfoModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9saWN5LWluZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZWwvcG9saWN5LWluZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLG1DQUFzQztBQUN0QyxtQ0FBNEI7QUFDNUIsK0RBQTRFO0FBSTVFLElBQWEsZUFBZSx1QkFBNUIsTUFBYSxlQUFnQixTQUFRLHVDQUFpQjtJQUVsRCxrQkFBa0I7UUFFZDs7O1dBR0c7UUFDSCxNQUFNLHdCQUF3QixHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDdEQsTUFBTSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQ3RDLFFBQVEsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUN4QyxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDMUMsVUFBVSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQzFDLFdBQVcsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUMzQyxrQkFBa0IsRUFBRSxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDNUUsTUFBTSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7U0FDckQsRUFBRTtZQUNDLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFVBQVUsRUFBRSxFQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBQztZQUM5RCxNQUFNLEVBQUUsaUJBQWUsQ0FBQyxlQUFlO1lBQ3ZDLFFBQVEsRUFBRSxpQkFBZSxDQUFDLGVBQWU7U0FDNUMsQ0FBQyxDQUFDO1FBRUgsd0JBQXdCLENBQUMsS0FBSyxDQUFDLEVBQUMsUUFBUSxFQUFFLENBQUMsRUFBQyxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFFOUQsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO0lBQ2pGLENBQUM7SUFFRCxNQUFNLEtBQUssZUFBZTtRQUN0QixPQUFPO1lBQ0gsU0FBUyxDQUFDLEdBQUcsRUFBRSxHQUFHO2dCQUNkLE9BQU8sYUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLENBQUM7U0FDSixDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUE7QUFuQ1ksZUFBZTtJQUYzQixjQUFLLENBQUMsV0FBVyxDQUFDO0lBQ2xCLGdCQUFPLENBQUMsa0JBQWtCLENBQUM7R0FDZixlQUFlLENBbUMzQjtBQW5DWSwwQ0FBZSJ9