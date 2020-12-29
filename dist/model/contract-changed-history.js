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
var ContractChangedHistoryModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractChangedHistoryModel = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const mongoose_model_base_1 = require("egg-freelog-base/database/mongoose-model-base");
let ContractChangedHistoryModel = ContractChangedHistoryModel_1 = class ContractChangedHistoryModel extends mongoose_model_base_1.MongooseModelBase {
    constructor(mongoose) {
        super(mongoose);
    }
    buildMongooseModel() {
        const contractChangedHistoryScheme = new this.mongoose.Schema({
            // _id: {type: this.mongoose.Schema.ObjectId, required: true}, // 外键,来源于合同ID
            contractId: { type: String, required: true },
            histories: { type: Array, required: true },
        }, {
            versionKey: false,
            timestamps: { createdAt: 'createDate', updatedAt: 'updateDate' },
            toJSON: ContractChangedHistoryModel_1.toObjectOptions,
            toObject: ContractChangedHistoryModel_1.toObjectOptions
        });
        return this.mongoose.model('contract-changed-histories', contractChangedHistoryScheme);
    }
    static get toObjectOptions() {
        return {
            transform(doc, ret) {
                return lodash_1.assign({ contractId: doc.id }, lodash_1.omit(ret, ['_id', 'id']));
            }
        };
    }
};
ContractChangedHistoryModel = ContractChangedHistoryModel_1 = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('model.ContractChangedHistory'),
    __param(0, midway_1.plugin('mongoose')),
    __metadata("design:paramtypes", [Object])
], ContractChangedHistoryModel);
exports.ContractChangedHistoryModel = ContractChangedHistoryModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtY2hhbmdlZC1oaXN0b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVsL2NvbnRyYWN0LWNoYW5nZWQtaGlzdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQW9DO0FBQ3BDLG1DQUE4QztBQUM5Qyx1RkFBZ0Y7QUFJaEYsSUFBYSwyQkFBMkIsbUNBQXhDLE1BQWEsMkJBQTRCLFNBQVEsdUNBQWlCO0lBRTlELFlBQWdDLFFBQVE7UUFDcEMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3BCLENBQUM7SUFFRCxrQkFBa0I7UUFFZCxNQUFNLDRCQUE0QixHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDMUQsNEVBQTRFO1lBQzVFLFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUMxQyxTQUFTLEVBQUUsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7U0FDM0MsRUFBRTtZQUNDLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFVBQVUsRUFBRSxFQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBQztZQUM5RCxNQUFNLEVBQUUsNkJBQTJCLENBQUMsZUFBZTtZQUNuRCxRQUFRLEVBQUUsNkJBQTJCLENBQUMsZUFBZTtTQUN4RCxDQUFDLENBQUM7UUFFSCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLDRCQUE0QixFQUFFLDRCQUE0QixDQUFDLENBQUM7SUFDM0YsQ0FBQztJQUVELE1BQU0sS0FBSyxlQUFlO1FBQ3RCLE9BQU87WUFDSCxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUc7Z0JBQ2QsT0FBTyxlQUFNLENBQUMsRUFBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBQyxFQUFFLGFBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xFLENBQUM7U0FDSixDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUE7QUE3QlksMkJBQTJCO0lBRnZDLGNBQUssQ0FBQyxXQUFXLENBQUM7SUFDbEIsZ0JBQU8sQ0FBQyw4QkFBOEIsQ0FBQztJQUd2QixXQUFBLGVBQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQTs7R0FGdEIsMkJBQTJCLENBNkJ2QztBQTdCWSxrRUFBMkIifQ==