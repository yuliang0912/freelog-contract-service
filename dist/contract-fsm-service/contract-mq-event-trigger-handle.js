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
        this.createKafkaConsumeRecord(payload).then();
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
    }
    async createKafkaConsumeRecord(payload) {
        const { message } = payload;
        console.log('收到消息', message);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtbXEtZXZlbnQtdHJpZ2dlci1oYW5kbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udHJhY3QtZnNtLXNlcnZpY2UvY29udHJhY3QtbXEtZXZlbnQtdHJpZ2dlci1oYW5kbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQWlFO0FBSWpFLHFDQUFvQztBQUNwQyxzR0FBNEY7QUFJNUYsSUFBYSw0QkFBNEIsR0FBekMsTUFBYSw0QkFBNEI7SUFHckMsUUFBUSxDQUFjO0lBRXRCLGtCQUFrQixDQUFnQztJQUVsRCxvQkFBb0IsQ0FBa0M7SUFFdEQsMEJBQTBCLENBQTZCO0lBRXZELHlCQUF5QixDQUF3RDtJQUVqRixlQUFlLEdBQUcsc0RBQXNELENBQUM7SUFDekUsa0JBQWtCLEdBQUcsa0NBQWtDLENBQUM7SUFFeEQ7UUFDSSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQTJCO1FBQzNDLE1BQU0sRUFBQyxPQUFPLEVBQUMsR0FBRyxPQUFPLENBQUM7UUFDMUIsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzlDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxFQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQztRQUMxRixJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsU0FBUyxDQUFDLFVBQVUsV0FBVyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUNyRixPQUFPO1NBQ1Y7UUFDRCxZQUFZLENBQUMsVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxFQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQztRQUNuRyxTQUFTLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDbEMsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ25ELE1BQU0sT0FBTyxDQUFDLGVBQWUsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUNyQyxPQUFPLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDOUYsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRTtZQUNaLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN6QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyxLQUFLLENBQUMsd0JBQXdCLENBQUMsT0FBMkI7UUFDOUQsTUFBTSxFQUFDLE9BQU8sRUFBQyxHQUFHLE9BQU8sQ0FBQztRQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3QixNQUFNLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxNQUFNLENBQUM7WUFDekMsUUFBUSxFQUFFLElBQUksQ0FBQyxlQUFlO1lBQzlCLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSztZQUNwQixTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVM7WUFDNUIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO1lBQ3RCLFVBQVUsRUFBRSxPQUFPLENBQUMsR0FBRztZQUN2QixnQkFBZ0IsRUFBRSxPQUFPLENBQUMsU0FBUztZQUNuQyxZQUFZLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ3JELENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDYixPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUN2QyxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7Z0JBQ3BCLFNBQVMsRUFBRSxPQUFPLENBQUMsU0FBUztnQkFDNUIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO2FBQ3pCLENBQUMsQ0FBQyxDQUFDO1FBQ1IsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0osQ0FBQTtBQTNERztJQURDLElBQUEsZUFBTSxHQUFFOzhCQUNDLHFCQUFXOzhEQUFDO0FBRXRCO0lBREMsSUFBQSxlQUFNLEdBQUU7O3dFQUN5QztBQUVsRDtJQURDLElBQUEsZUFBTSxHQUFFOzswRUFDNkM7QUFFdEQ7SUFEQyxJQUFBLGVBQU0sR0FBRTs4QkFDbUIsdUNBQTBCO2dGQUFDO0FBRXZEO0lBREMsSUFBQSxlQUFNLEdBQUU7OytFQUN3RTtBQVh4RSw0QkFBNEI7SUFGeEMsSUFBQSxnQkFBTyxHQUFFO0lBQ1QsSUFBQSxjQUFLLEVBQUMsa0JBQVMsQ0FBQyxTQUFTLENBQUM7O0dBQ2QsNEJBQTRCLENBOER4QztBQTlEWSxvRUFBNEIifQ==