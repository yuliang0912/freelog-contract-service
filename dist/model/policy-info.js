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
            // isPublic: {type: Number, required: false, enum: [0, 1], default: 0},
            // 状态机描述信息.牵扯到具体的变量信息等,则保存在具体的合约中
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9saWN5LWluZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZWwvcG9saWN5LWluZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLG1DQUFzQztBQUN0QyxtQ0FBNEI7QUFDNUIsK0RBQTRFO0FBSTVFLElBQWEsZUFBZSx1QkFBNUIsTUFBYSxlQUFnQixTQUFRLHVDQUFpQjtJQUVsRCxrQkFBa0I7UUFFZDs7O1dBR0c7UUFDSCxNQUFNLHdCQUF3QixHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDdEQsTUFBTSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQ3RDLFFBQVEsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUN4QyxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDMUMsVUFBVSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQzFDLFdBQVcsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUMzQyx1RUFBdUU7WUFDdkUsaUNBQWlDO1lBQ2pDLGtCQUFrQixFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUM1RSxNQUFNLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztTQUNyRCxFQUFFO1lBQ0MsVUFBVSxFQUFFLEtBQUs7WUFDakIsVUFBVSxFQUFFLEVBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFDO1lBQzlELE1BQU0sRUFBRSxpQkFBZSxDQUFDLGVBQWU7WUFDdkMsUUFBUSxFQUFFLGlCQUFlLENBQUMsZUFBZTtTQUM1QyxDQUFDLENBQUM7UUFFSCx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsRUFBQyxRQUFRLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUU5RCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLHNCQUFzQixFQUFFLHdCQUF3QixDQUFDLENBQUM7SUFDakYsQ0FBQztJQUVELE1BQU0sS0FBSyxlQUFlO1FBQ3RCLE9BQU87WUFDSCxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUc7Z0JBQ2QsT0FBTyxhQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDcEMsQ0FBQztTQUNKLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQTtBQXJDWSxlQUFlO0lBRjNCLGNBQUssQ0FBQyxXQUFXLENBQUM7SUFDbEIsZ0JBQU8sQ0FBQyxrQkFBa0IsQ0FBQztHQUNmLGVBQWUsQ0FxQzNCO0FBckNZLDBDQUFlIn0=