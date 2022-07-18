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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractMqEventTriggerHandle = void 0;
const midway_1 = require("midway");
const mongodb_1 = require("mongodb");
const kafka_consume_record_provider_1 = require("../app/data-provider/kafka-consume-record-provider");
let ContractMqEventTriggerHandle = class ContractMqEventTriggerHandle {
    mongoose;
    policyInfoProvider;
    contractInfoProvider;
    kafkaConsumeRecordProvider;
    buildContractStateMachine;
    consumerGroupId = 'freelog-contract-service#contract-event-handle-group';
    subscribeTopicName = 'contract-fsm-event-trigger-topic';
    constructor() {
        this.messageHandle = this.messageHandle.bind(this);
    }
    /**
     * mq消息处理
     * @param payload
     */
    async messageHandle(payload) {
        const { message } = payload;
        const eventInfo = JSON.parse(message.value.toString());
        const contractInfo = await this.contractInfoProvider.findOne({ _id: eventInfo.contractId });
        if (!contractInfo) {
            console.error(`未找到合约信息,contractId:${eventInfo.contractId},offset:${message.offset}`);
            return;
        }
        contractInfo.policyInfo = await this.policyInfoProvider.findOne({ policyId: contractInfo.policyId });
        eventInfo.offset = message.offset;
        const session = await this.mongoose.startSession();
        await session.withTransaction(async () => {
            return this.buildContractStateMachine(contractInfo).execContractEvent(session, eventInfo);
        }).finally(() => {
            session.endSession();
        });
        await this.kafkaConsumeRecordProvider.create({
            consumer: this.consumerGroupId,
            topic: payload.topic,
            partition: payload.partition,
            offset: message.offset,
            messageKey: message.key,
            messageTimestamp: message.timestamp,
            messageValue: JSON.parse(message.value.toString())
        }).catch(error => {
            console.log('kafka消费记录失败' + JSON.stringify({
                topic: payload.topic,
                partition: payload.partition,
                offset: message.offset
            }));
        });
    }
};
__decorate([
    (0, midway_1.plugin)(),
    __metadata("design:type", mongodb_1.MongoClient)
], ContractMqEventTriggerHandle.prototype, "mongoose", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ContractMqEventTriggerHandle.prototype, "policyInfoProvider", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ContractMqEventTriggerHandle.prototype, "contractInfoProvider", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", kafka_consume_record_provider_1.default)
], ContractMqEventTriggerHandle.prototype, "kafkaConsumeRecordProvider", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Function)
], ContractMqEventTriggerHandle.prototype, "buildContractStateMachine", void 0);
ContractMqEventTriggerHandle = __decorate([
    (0, midway_1.provide)(),
    (0, midway_1.scope)(midway_1.ScopeEnum.Singleton),
    __metadata("design:paramtypes", [])
], ContractMqEventTriggerHandle);
exports.ContractMqEventTriggerHandle = ContractMqEventTriggerHandle;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtbXEtZXZlbnQtdHJpZ2dlci1oYW5kbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udHJhY3QtZnNtLXNlcnZpY2UvY29udHJhY3QtbXEtZXZlbnQtdHJpZ2dlci1oYW5kbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQWlFO0FBSWpFLHFDQUFvQztBQUNwQyxzR0FBNEY7QUFJNUYsSUFBYSw0QkFBNEIsR0FBekMsTUFBYSw0QkFBNEI7SUFHckMsUUFBUSxDQUFjO0lBRXRCLGtCQUFrQixDQUFnQztJQUVsRCxvQkFBb0IsQ0FBa0M7SUFFdEQsMEJBQTBCLENBQTZCO0lBRXZELHlCQUF5QixDQUF3RDtJQUVqRixlQUFlLEdBQUcsc0RBQXNELENBQUM7SUFDekUsa0JBQWtCLEdBQUcsa0NBQWtDLENBQUM7SUFFeEQ7UUFDSSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQTJCO1FBQzNDLE1BQU0sRUFBQyxPQUFPLEVBQUMsR0FBRyxPQUFPLENBQUM7UUFDMUIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFFdkQsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLEVBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDO1FBQzFGLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLHNCQUFzQixTQUFTLENBQUMsVUFBVSxXQUFXLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ3JGLE9BQU87U0FDVjtRQUNELFlBQVksQ0FBQyxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLEVBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDO1FBQ25HLFNBQVMsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUNsQyxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDbkQsTUFBTSxPQUFPLENBQUMsZUFBZSxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQ3JDLE9BQU8sSUFBSSxDQUFDLHlCQUF5QixDQUFDLFlBQVksQ0FBQyxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM5RixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFO1lBQ1osT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUMsTUFBTSxDQUFDO1lBQ3pDLFFBQVEsRUFBRSxJQUFJLENBQUMsZUFBZTtZQUM5QixLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7WUFDcEIsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTO1lBQzVCLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtZQUN0QixVQUFVLEVBQUUsT0FBTyxDQUFDLEdBQUc7WUFDdkIsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLFNBQVM7WUFDbkMsWUFBWSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUNyRCxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDdkMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLO2dCQUNwQixTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVM7Z0JBQzVCLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTthQUN6QixDQUFDLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKLENBQUE7QUF2REc7SUFEQyxJQUFBLGVBQU0sR0FBRTs4QkFDQyxxQkFBVzs4REFBQztBQUV0QjtJQURDLElBQUEsZUFBTSxHQUFFOzt3RUFDeUM7QUFFbEQ7SUFEQyxJQUFBLGVBQU0sR0FBRTs7MEVBQzZDO0FBRXREO0lBREMsSUFBQSxlQUFNLEdBQUU7OEJBQ21CLHVDQUEwQjtnRkFBQztBQUV2RDtJQURDLElBQUEsZUFBTSxHQUFFOzsrRUFDd0U7QUFYeEUsNEJBQTRCO0lBRnhDLElBQUEsZ0JBQU8sR0FBRTtJQUNULElBQUEsY0FBSyxFQUFDLGtCQUFTLENBQUMsU0FBUyxDQUFDOztHQUNkLDRCQUE0QixDQTBEeEM7QUExRFksb0VBQTRCIn0=