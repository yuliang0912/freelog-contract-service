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
    midway_1.config('kafka'),
    __metadata("design:type", Object)
], KafkaStartup.prototype, "kafkaConfig", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", client_1.KafkaClient)
], KafkaStartup.prototype, "kafkaClient", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", contract_mq_event_trigger_handle_1.ContractMqEventTriggerHandle)
], KafkaStartup.prototype, "contractMqEventTriggerHandle", void 0);
__decorate([
    midway_1.init(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KafkaStartup.prototype, "startUp", null);
KafkaStartup = __decorate([
    midway_1.provide(),
    midway_1.scope(midway_1.ScopeEnum.Singleton)
], KafkaStartup);
exports.KafkaStartup = KafkaStartup;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnR1cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWZrYS9zdGFydHVwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUF1RTtBQUN2RSxxQ0FBcUM7QUFFckMsK0dBQXNHO0FBSXRHLElBQWEsWUFBWSxHQUF6QixNQUFhLFlBQVk7SUFTckI7O09BRUc7SUFFSCxLQUFLLENBQUMsT0FBTztRQUNULElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEtBQUssSUFBSSxFQUFFO1lBQ2xDLE9BQU87U0FDVjtRQUNELE1BQU0sSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3JDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDdkQsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNwRCxPQUFPLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3pELENBQUMsQ0FBQyxDQUFDO1FBQ0gsZ0NBQWdDO1FBQ2hDLDREQUE0RDtRQUM1RCxtQkFBbUI7UUFDbkIsa0NBQWtDO1FBQ2xDLHNEQUFzRDtRQUN0RCxxREFBcUQ7UUFDckQsZ0RBQWdEO1FBQ2hELDhCQUE4QjtRQUM5QixzREFBc0Q7UUFDdEQsc0NBQXNDO1FBQ3RDLHNEQUFzRDtRQUN0RCxzQ0FBc0M7UUFDdEMsbUNBQW1DO1FBQ25DLG9DQUFvQztRQUNwQyxnQ0FBZ0M7UUFDaEMsYUFBYTtRQUNiLFVBQVU7UUFDVixlQUFlO1FBQ2YsTUFBTTtJQUNWLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxlQUFlO1FBQ2pCLE1BQU0sTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7UUFDbkQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMvQyxDQUFDO0NBQ0osQ0FBQTtBQWxERztJQURDLGVBQU0sQ0FBQyxPQUFPLENBQUM7O2lEQUNKO0FBRVo7SUFEQyxlQUFNLEVBQUU7OEJBQ0ksb0JBQVc7aURBQUM7QUFFekI7SUFEQyxlQUFNLEVBQUU7OEJBQ3FCLCtEQUE0QjtrRUFBQztBQU0zRDtJQURDLGFBQUksRUFBRTs7OzsyQ0FnQ047QUE1Q1EsWUFBWTtJQUZ4QixnQkFBTyxFQUFFO0lBQ1QsY0FBSyxDQUFDLGtCQUFTLENBQUMsU0FBUyxDQUFDO0dBQ2QsWUFBWSxDQXFEeEI7QUFyRFksb0NBQVkifQ==