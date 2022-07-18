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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaConsumeRecord = void 0;
const midway_1 = require("midway");
const mongoose_model_base_1 = require("egg-freelog-base/database/mongoose-model-base");
let KafkaConsumeRecord = class KafkaConsumeRecord extends mongoose_model_base_1.MongooseModelBase {
    constructor(mongoose) {
        super(mongoose);
    }
    buildMongooseModel() {
        const KafkaConsumeRecordScheme = new this.mongoose.Schema({
            consumer: { type: String, required: true },
            topic: { type: String, required: true },
            partition: { type: Number, required: true },
            offset: { type: Number, required: true },
            messageKey: { type: String, default: '', required: false },
            messageTimestamp: { type: Number, required: true },
            messageValue: {}
        }, {
            versionKey: false,
            timestamps: { createdAt: 'createDate', updatedAt: 'updateDate' }
        });
        return this.mongoose.model('kafka-consume-records', KafkaConsumeRecordScheme);
    }
};
KafkaConsumeRecord = __decorate([
    (0, midway_1.scope)('Singleton'),
    (0, midway_1.provide)('model.KafkaConsumeRecord'),
    __param(0, (0, midway_1.plugin)('mongoose')),
    __metadata("design:paramtypes", [Object])
], KafkaConsumeRecord);
exports.KafkaConsumeRecord = KafkaConsumeRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2Fma2EtY29uc3VtZS1yZWNvcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZWwva2Fma2EtY29uc3VtZS1yZWNvcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQThDO0FBQzlDLHVGQUFnRjtBQUloRixJQUFhLGtCQUFrQixHQUEvQixNQUFhLGtCQUFtQixTQUFRLHVDQUFpQjtJQUVyRCxZQUFnQyxRQUFRO1FBQ3BDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNwQixDQUFDO0lBRUQsa0JBQWtCO1FBQ2QsTUFBTSx3QkFBd0IsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQ3RELFFBQVEsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUN4QyxLQUFLLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDckMsU0FBUyxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQ3pDLE1BQU0sRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUN0QyxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBQztZQUN4RCxnQkFBZ0IsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUNoRCxZQUFZLEVBQUUsRUFBRTtTQUNuQixFQUFFO1lBQ0MsVUFBVSxFQUFFLEtBQUs7WUFDakIsVUFBVSxFQUFFLEVBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFDO1NBQ2pFLENBQUMsQ0FBQztRQUVILE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztJQUNsRixDQUFDO0NBQ0osQ0FBQTtBQXRCWSxrQkFBa0I7SUFGOUIsSUFBQSxjQUFLLEVBQUMsV0FBVyxDQUFDO0lBQ2xCLElBQUEsZ0JBQU8sRUFBQywwQkFBMEIsQ0FBQztJQUduQixXQUFBLElBQUEsZUFBTSxFQUFDLFVBQVUsQ0FBQyxDQUFBOztHQUZ0QixrQkFBa0IsQ0FzQjlCO0FBdEJZLGdEQUFrQiJ9