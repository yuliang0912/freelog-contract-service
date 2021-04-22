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
var ContractInvalidTransitionModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractInvalidTransitionModel = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const mongoose_model_base_1 = require("egg-freelog-base/database/mongoose-model-base");
let ContractInvalidTransitionModel = ContractInvalidTransitionModel_1 = class ContractInvalidTransitionModel extends mongoose_model_base_1.MongooseModelBase {
    constructor(mongoose) {
        super(mongoose);
    }
    buildMongooseModel() {
        const ContractInvalidTransitionSchema = new this.mongoose.Schema({
            contractId: { type: String, required: true },
            contractState: { type: String, required: true },
            eventId: { type: String, required: true },
            eventCode: { type: String, required: true },
            triggerDate: { type: Date, required: true },
            eventInfo: { type: this.mongoose.Schema.Types.Mixed, default: {}, required: false },
            remark: { type: String, required: false, default: '' }
        }, {
            versionKey: false,
            timestamps: { createdAt: 'createDate', updatedAt: 'updateDate' },
            toJSON: ContractInvalidTransitionModel_1.toObjectOptions,
            toObject: ContractInvalidTransitionModel_1.toObjectOptions
        });
        return this.mongoose.model('contract-invalid-transition-records', ContractInvalidTransitionSchema);
    }
    static get toObjectOptions() {
        return {
            transform(doc, ret) {
                return lodash_1.assign({ contractId: doc.id }, lodash_1.omit(ret, ['_id', 'id']));
            }
        };
    }
};
ContractInvalidTransitionModel = ContractInvalidTransitionModel_1 = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('model.ContractInvalidTransitionModel'),
    __param(0, midway_1.plugin('mongoose')),
    __metadata("design:paramtypes", [Object])
], ContractInvalidTransitionModel);
exports.ContractInvalidTransitionModel = ContractInvalidTransitionModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtaW52YWxpZC10cmFuc2l0aW9uLXJlY29yZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9jb250cmFjdC1pbnZhbGlkLXRyYW5zaXRpb24tcmVjb3JkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBb0M7QUFDcEMsbUNBQThDO0FBQzlDLHVGQUFnRjtBQUloRixJQUFhLDhCQUE4QixzQ0FBM0MsTUFBYSw4QkFBK0IsU0FBUSx1Q0FBaUI7SUFFakUsWUFBZ0MsUUFBUTtRQUNwQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDcEIsQ0FBQztJQUVELGtCQUFrQjtRQUVkLE1BQU0sK0JBQStCLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUM3RCxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDMUMsYUFBYSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQzdDLE9BQU8sRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUN2QyxTQUFTLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDekMsV0FBVyxFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQ3pDLFNBQVMsRUFBRSxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBQztZQUNqRixNQUFNLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBQztTQUN2RCxFQUFFO1lBQ0MsVUFBVSxFQUFFLEtBQUs7WUFDakIsVUFBVSxFQUFFLEVBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFDO1lBQzlELE1BQU0sRUFBRSxnQ0FBOEIsQ0FBQyxlQUFlO1lBQ3RELFFBQVEsRUFBRSxnQ0FBOEIsQ0FBQyxlQUFlO1NBQzNELENBQUMsQ0FBQztRQUVILE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMscUNBQXFDLEVBQUUsK0JBQStCLENBQUMsQ0FBQztJQUN2RyxDQUFDO0lBRUQsTUFBTSxLQUFLLGVBQWU7UUFDdEIsT0FBTztZQUNILFNBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRztnQkFDZCxPQUFPLGVBQU0sQ0FBQyxFQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFDLEVBQUUsYUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEUsQ0FBQztTQUNKLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQTtBQWpDWSw4QkFBOEI7SUFGMUMsY0FBSyxDQUFDLFdBQVcsQ0FBQztJQUNsQixnQkFBTyxDQUFDLHNDQUFzQyxDQUFDO0lBRy9CLFdBQUEsZUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFBOztHQUZ0Qiw4QkFBOEIsQ0FpQzFDO0FBakNZLHdFQUE4QiJ9