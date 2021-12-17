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
exports.KafkaStartup = void 0;
const midway_1 = require("midway");
const client_1 = require("./client");
const contract_mq_event_trigger_handle_1 = require("../contract-fsm-service/contract-mq-event-trigger-handle");
let KafkaStartup = class KafkaStartup {
    kafkaConfig;
    kafkaClient;
    contractMqEventTriggerHandle;
    /**
     * 启动,连接kafka-producer,订阅topic
     */
    async startUp() {
        if (this.kafkaConfig.enable !== true) {
            return;
        }
        await this.subscribeTopics().then(() => {
            console.log('kafka topic 订阅成功!');
        }).catch(error => {
            console.log('kafka topic 订阅失败!', error.toString());
        });
        await this.kafkaClient.producer.connect().catch(error => {
            console.log('kafka producer connect failed,', error);
        });
        // await this.kafkaClient.send({
        //     topic: 'resource-contract-auth-status-changed-queue',
        //     messages: [{
        //         value: JSON.stringify({
        //             contractId: '5f326eb01bcaeb00347b8eac',
        //             subjectId: '5f3245bbf5d0dd002f2f0610',
        //             subjectName: '12345676789/base1',
        //             subjectType: 1,
        //             licenseeId: '5f325f4034818a002f4a9b37',
        //             licenseeOwnerId: 50028,
        //             licensorId: '5f3245bbf5d0dd002f2f0610',
        //             licensorOwnerId: 50028,
        //             beforeAuthStatus: 1,
        //             afterAuthStatus: 128,
        //             contractStatus: 1
        //         })
        //     }],
        //     acks: -1
        // });
    }
    /**
     * 订阅
     */
    async subscribeTopics() {
        const topics = [this.contractMqEventTriggerHandle];
        return this.kafkaClient.subscribes(topics);
    }
};
__decorate([
    (0, midway_1.config)('kafka'),
    __metadata("design:type", Object)
], KafkaStartup.prototype, "kafkaConfig", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", client_1.KafkaClient)
], KafkaStartup.prototype, "kafkaClient", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", contract_mq_event_trigger_handle_1.ContractMqEventTriggerHandle)
], KafkaStartup.prototype, "contractMqEventTriggerHandle", void 0);
__decorate([
    (0, midway_1.init)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KafkaStartup.prototype, "startUp", null);
KafkaStartup = __decorate([
    (0, midway_1.provide)(),
    (0, midway_1.scope)(midway_1.ScopeEnum.Singleton)
], KafkaStartup);
exports.KafkaStartup = KafkaStartup;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnR1cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWZrYS9zdGFydHVwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUF1RTtBQUN2RSxxQ0FBcUM7QUFFckMsK0dBQXNHO0FBSXRHLElBQWEsWUFBWSxHQUF6QixNQUFhLFlBQVk7SUFHckIsV0FBVyxDQUFDO0lBRVosV0FBVyxDQUFjO0lBRXpCLDRCQUE0QixDQUErQjtJQUUzRDs7T0FFRztJQUVILEtBQUssQ0FBQyxPQUFPO1FBQ1QsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sS0FBSyxJQUFJLEVBQUU7WUFDbEMsT0FBTztTQUNWO1FBQ0QsTUFBTSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDckMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN2RCxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3BELE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekQsQ0FBQyxDQUFDLENBQUM7UUFDSCxnQ0FBZ0M7UUFDaEMsNERBQTREO1FBQzVELG1CQUFtQjtRQUNuQixrQ0FBa0M7UUFDbEMsc0RBQXNEO1FBQ3RELHFEQUFxRDtRQUNyRCxnREFBZ0Q7UUFDaEQsOEJBQThCO1FBQzlCLHNEQUFzRDtRQUN0RCxzQ0FBc0M7UUFDdEMsc0RBQXNEO1FBQ3RELHNDQUFzQztRQUN0QyxtQ0FBbUM7UUFDbkMsb0NBQW9DO1FBQ3BDLGdDQUFnQztRQUNoQyxhQUFhO1FBQ2IsVUFBVTtRQUNWLGVBQWU7UUFDZixNQUFNO0lBQ1YsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLGVBQWU7UUFDakIsTUFBTSxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQztRQUNuRCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9DLENBQUM7Q0FDSixDQUFBO0FBbERHO0lBREMsSUFBQSxlQUFNLEVBQUMsT0FBTyxDQUFDOztpREFDSjtBQUVaO0lBREMsSUFBQSxlQUFNLEdBQUU7OEJBQ0ksb0JBQVc7aURBQUM7QUFFekI7SUFEQyxJQUFBLGVBQU0sR0FBRTs4QkFDcUIsK0RBQTRCO2tFQUFDO0FBTTNEO0lBREMsSUFBQSxhQUFJLEdBQUU7Ozs7MkNBZ0NOO0FBNUNRLFlBQVk7SUFGeEIsSUFBQSxnQkFBTyxHQUFFO0lBQ1QsSUFBQSxjQUFLLEVBQUMsa0JBQVMsQ0FBQyxTQUFTLENBQUM7R0FDZCxZQUFZLENBcUR4QjtBQXJEWSxvQ0FBWSJ9