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
        const { batch, resolveOffset, heartbeat } = payload;
        const policyIds = [];
        const contractIds = batch.messages.map(x => x.key.toString());
        const contractMap = await this.contractInfoProvider.find({ _id: { $in: contractIds } }).then(list => {
            list.forEach(x => policyIds.push(x.policyId));
            return new Map(list.map(x => [x.contractId, x]));
        });
        const policyMap = await this.policyInfoProvider.find({ policyId: { $in: policyIds } }).then(list => {
            return new Map(list.map(x => [x.policyId, x]));
        });
        for (let message of batch.messages) {
            const eventInfo = JSON.parse(message.value.toString());
            console.log('接收到合约事件触发' + JSON.stringify(eventInfo));
            const contractInfo = contractMap.get(eventInfo.contractId);
            if (!contractInfo) {
                console.log('未找到合约信息', '==========end==============');
                resolveOffset(message.offset);
                continue;
            }
            eventInfo.offset = message.offset;
            contractInfo.policyInfo = policyMap.get(contractInfo.policyId);
            const session = await this.mongoose.startSession();
            await session.withTransaction(async () => {
                return this.buildContractStateMachine(contractInfo).execContractEvent(session, eventInfo);
            }).then(() => {
                resolveOffset(message.offset);
            }).finally(() => {
                session.endSession();
            });
        }
        await heartbeat();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtbXEtZXZlbnQtdHJpZ2dlci1oYW5kbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udHJhY3QtZnNtLXNlcnZpY2UvY29udHJhY3QtbXEtZXZlbnQtdHJpZ2dlci1oYW5kbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQWlFO0FBSWpFLHFDQUFvQztBQUlwQyxJQUFhLDRCQUE0QixHQUF6QyxNQUFhLDRCQUE0QjtJQWNyQztRQUhBLG9CQUFlLEdBQUcsc0RBQXNELENBQUM7UUFDekUsdUJBQWtCLEdBQUcsa0NBQWtDLENBQUM7UUFHcEQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUF5QjtRQUN6QyxNQUFNLEVBQUMsS0FBSyxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUMsR0FBRyxPQUFPLENBQUM7UUFDbEQsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzlELE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBRSxFQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUMsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzVGLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzlDLE9BQU8sSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckQsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBQyxRQUFRLEVBQUUsRUFBQyxHQUFHLEVBQUUsU0FBUyxFQUFDLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMzRixPQUFPLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQyxDQUFDO1FBQ0gsS0FBSyxJQUFJLE9BQU8sSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFO1lBQ2hDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZELE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNyRCxNQUFNLFlBQVksR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMzRCxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLDZCQUE2QixDQUFDLENBQUM7Z0JBQ3RELGFBQWEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzlCLFNBQVM7YUFDWjtZQUNELFNBQVMsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztZQUNsQyxZQUFZLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQy9ELE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNuRCxNQUFNLE9BQU8sQ0FBQyxlQUFlLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQ3JDLE9BQU8sSUFBSSxDQUFDLHlCQUF5QixDQUFDLFlBQVksQ0FBQyxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM5RixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNULGFBQWEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRTtnQkFDWixPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDekIsQ0FBQyxDQUFDLENBQUM7U0FDTjtRQUNELE1BQU0sU0FBUyxFQUFFLENBQUM7SUFDdEIsQ0FBQztDQUNKLENBQUE7QUFwREc7SUFEQyxlQUFNLEVBQUU7OEJBQ0MscUJBQVc7OERBQUM7QUFFdEI7SUFEQyxlQUFNLEVBQUU7O3dFQUN5QztBQUVsRDtJQURDLGVBQU0sRUFBRTs7MEVBQzZDO0FBRXREO0lBREMsZUFBTSxFQUFFOzsrRUFDd0U7QUFUeEUsNEJBQTRCO0lBRnhDLGdCQUFPLEVBQUU7SUFDVCxjQUFLLENBQUMsa0JBQVMsQ0FBQyxTQUFTLENBQUM7O0dBQ2QsNEJBQTRCLENBdUR4QztBQXZEWSxvRUFBNEIifQ==