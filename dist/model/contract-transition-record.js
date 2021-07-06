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
var ContractTransitionRecordModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractTransitionRecordModel = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const mongoose_model_base_1 = require("egg-freelog-base/database/mongoose-model-base");
let ContractTransitionRecordModel = ContractTransitionRecordModel_1 = class ContractTransitionRecordModel extends mongoose_model_base_1.MongooseModelBase {
    constructor(mongoose) {
        super(mongoose);
    }
    buildMongooseModel() {
        const contractTransitionRecordSchema = new this.mongoose.Schema({
            contractId: { type: String, required: true },
            eventId: { type: String, required: true },
            fromState: { type: String, required: true },
            toState: { type: String, required: true },
            eventInfo: { type: this.mongoose.Schema.Types.Mixed, required: true },
        }, {
            versionKey: false,
            timestamps: { createdAt: 'createDate', updatedAt: 'updateDate' },
            toJSON: ContractTransitionRecordModel_1.toObjectOptions,
            toObject: ContractTransitionRecordModel_1.toObjectOptions
        });
        contractTransitionRecordSchema.virtual('stateId').get(function () {
            return this.id;
        });
        return this.mongoose.model('contract-transition-records', contractTransitionRecordSchema);
    }
    static get toObjectOptions() {
        return {
            transform(doc, ret) {
                return lodash_1.assign({ contractId: doc.id }, lodash_1.omit(ret, ['_id', 'id']));
            }
        };
    }
};
ContractTransitionRecordModel = ContractTransitionRecordModel_1 = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('model.ContractTransitionRecord'),
    __param(0, midway_1.plugin('mongoose')),
    __metadata("design:paramtypes", [Object])
], ContractTransitionRecordModel);
exports.ContractTransitionRecordModel = ContractTransitionRecordModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtdHJhbnNpdGlvbi1yZWNvcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZWwvY29udHJhY3QtdHJhbnNpdGlvbi1yZWNvcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1DQUFvQztBQUNwQyxtQ0FBOEM7QUFDOUMsdUZBQWdGO0FBSWhGLElBQWEsNkJBQTZCLHFDQUExQyxNQUFhLDZCQUE4QixTQUFRLHVDQUFpQjtJQUVoRSxZQUFnQyxRQUFRO1FBQ3BDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNwQixDQUFDO0lBRUQsa0JBQWtCO1FBQ2QsTUFBTSw4QkFBOEIsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQzVELFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUMxQyxPQUFPLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDdkMsU0FBUyxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQ3pDLE9BQU8sRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUN2QyxTQUFTLEVBQUUsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1NBQ3RFLEVBQUU7WUFDQyxVQUFVLEVBQUUsS0FBSztZQUNqQixVQUFVLEVBQUUsRUFBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUM7WUFDOUQsTUFBTSxFQUFFLCtCQUE2QixDQUFDLGVBQWU7WUFDckQsUUFBUSxFQUFFLCtCQUE2QixDQUFDLGVBQWU7U0FDMUQsQ0FBQyxDQUFDO1FBRUgsOEJBQThCLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUNsRCxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLDZCQUE2QixFQUFFLDhCQUE4QixDQUFDLENBQUM7SUFDOUYsQ0FBQztJQUVELE1BQU0sS0FBSyxlQUFlO1FBQ3RCLE9BQU87WUFDSCxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUc7Z0JBQ2QsT0FBTyxlQUFNLENBQUMsRUFBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBQyxFQUFFLGFBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xFLENBQUM7U0FDSixDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUE7QUFsQ1ksNkJBQTZCO0lBRnpDLGNBQUssQ0FBQyxXQUFXLENBQUM7SUFDbEIsZ0JBQU8sQ0FBQyxnQ0FBZ0MsQ0FBQztJQUd6QixXQUFBLGVBQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQTs7R0FGdEIsNkJBQTZCLENBa0N6QztBQWxDWSxzRUFBNkIifQ==