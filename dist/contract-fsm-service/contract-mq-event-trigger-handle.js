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
let ContractMqEventTriggerHandle = class ContractMqEventTriggerHandle {
    constructor() {
        this.consumerGroupId = 'freelog-contract-service#contract-event-handle-group';
        this.subscribeTopicName = 'contract-fsm-event-trigger-topic';
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
            console.log(`未找到合约信息,contractId:${eventInfo.contractId},offset:${message.offset}`);
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
};
__decorate([
    midway_1.plugin(),
    __metadata("design:type", mongodb_1.MongoClient)
], ContractMqEventTriggerHandle.prototype, "mongoose", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractMqEventTriggerHandle.prototype, "policyInfoProvider", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractMqEventTriggerHandle.prototype, "contractInfoProvider", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Function)
], ContractMqEventTriggerHandle.prototype, "buildContractStateMachine", void 0);
ContractMqEventTriggerHandle = __decorate([
    midway_1.provide(),
    midway_1.scope(midway_1.ScopeEnum.Singleton),
    __metadata("design:paramtypes", [])
], ContractMqEventTriggerHandle);
exports.ContractMqEventTriggerHandle = ContractMqEventTriggerHandle;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtbXEtZXZlbnQtdHJpZ2dlci1oYW5kbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udHJhY3QtZnNtLXNlcnZpY2UvY29udHJhY3QtbXEtZXZlbnQtdHJpZ2dlci1oYW5kbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQWlFO0FBSWpFLHFDQUFvQztBQUlwQyxJQUFhLDRCQUE0QixHQUF6QyxNQUFhLDRCQUE0QjtJQWNyQztRQUhBLG9CQUFlLEdBQUcsc0RBQXNELENBQUM7UUFDekUsdUJBQWtCLEdBQUcsa0NBQWtDLENBQUM7UUFHcEQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUEyQjtRQUMzQyxNQUFNLEVBQUMsT0FBTyxFQUFDLEdBQUcsT0FBTyxDQUFDO1FBQzFCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBRXZELE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxFQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQztRQUMxRixJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsU0FBUyxDQUFDLFVBQVUsV0FBVyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUNuRixPQUFPO1NBQ1Y7UUFDRCxZQUFZLENBQUMsVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxFQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQztRQUNuRyxTQUFTLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDbEMsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ25ELE1BQU0sT0FBTyxDQUFDLGVBQWUsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUNyQyxPQUFPLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDOUYsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRTtZQUNaLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN6QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSixDQUFBO0FBckNHO0lBREMsZUFBTSxFQUFFOzhCQUNDLHFCQUFXOzhEQUFDO0FBRXRCO0lBREMsZUFBTSxFQUFFOzt3RUFDeUM7QUFFbEQ7SUFEQyxlQUFNLEVBQUU7OzBFQUM2QztBQUV0RDtJQURDLGVBQU0sRUFBRTs7K0VBQ3dFO0FBVHhFLDRCQUE0QjtJQUZ4QyxnQkFBTyxFQUFFO0lBQ1QsY0FBSyxDQUFDLGtCQUFTLENBQUMsU0FBUyxDQUFDOztHQUNkLDRCQUE0QixDQXdDeEM7QUF4Q1ksb0VBQTRCIn0=