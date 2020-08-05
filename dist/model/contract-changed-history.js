"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ContractChangedHistoryModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractChangedHistoryModel = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const mongoose_model_base_1 = require("./mongoose-model-base");
let ContractChangedHistoryModel = ContractChangedHistoryModel_1 = class ContractChangedHistoryModel extends mongoose_model_base_1.MongooseModelBase {
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
        // contractChangedHistoryScheme.virtual('contractId').get(function (this: any) {
        //     return this.id;
        // });
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
    midway_1.provide('model.ContractChangedHistory')
], ContractChangedHistoryModel);
exports.ContractChangedHistoryModel = ContractChangedHistoryModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtY2hhbmdlZC1oaXN0b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVsL2NvbnRyYWN0LWNoYW5nZWQtaGlzdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsbUNBQW9DO0FBQ3BDLG1DQUFzQztBQUN0QywrREFBNEU7QUFJNUUsSUFBYSwyQkFBMkIsbUNBQXhDLE1BQWEsMkJBQTRCLFNBQVEsdUNBQWlCO0lBRTlELGtCQUFrQjtRQUVkLE1BQU0sNEJBQTRCLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUMxRCw0RUFBNEU7WUFDNUUsVUFBVSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQzFDLFNBQVMsRUFBRSxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztTQUMzQyxFQUFFO1lBQ0MsVUFBVSxFQUFFLEtBQUs7WUFDakIsVUFBVSxFQUFFLEVBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFDO1lBQzlELE1BQU0sRUFBRSw2QkFBMkIsQ0FBQyxlQUFlO1lBQ25ELFFBQVEsRUFBRSw2QkFBMkIsQ0FBQyxlQUFlO1NBQ3hELENBQUMsQ0FBQztRQUVILGdGQUFnRjtRQUNoRixzQkFBc0I7UUFDdEIsTUFBTTtRQUVOLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsNEJBQTRCLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztJQUMzRixDQUFDO0lBRUQsTUFBTSxLQUFLLGVBQWU7UUFDdEIsT0FBTztZQUNILFNBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRztnQkFDZCxPQUFPLGVBQU0sQ0FBQyxFQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFDLEVBQUUsYUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEUsQ0FBQztTQUNKLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQTtBQTdCWSwyQkFBMkI7SUFGdkMsY0FBSyxDQUFDLFdBQVcsQ0FBQztJQUNsQixnQkFBTyxDQUFDLDhCQUE4QixDQUFDO0dBQzNCLDJCQUEyQixDQTZCdkM7QUE3Qlksa0VBQTJCIn0=