"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaManager = void 0;
const kafkajs_1 = require("kafkajs");
const { Kafka } = require('kafkajs');
class KafkaManager {
    TOPIC_CONTRACT_EVENT_TRIGGER_NAME;
    async main() {
        const kafka = new Kafka({
            clientId: 'freelog-contract-service',
            logLevel: kafkajs_1.logLevel.ERROR,
            brokers: ['192.168.164.165:9090']
        });
        const admin = kafka.admin();
        await admin.connect().then(() => {
            admin.createTopics({
                topics: [{ topic: this.TOPIC_CONTRACT_EVENT_TRIGGER_NAME, numPartitions: 2 }]
            });
        });
    }
}
exports.KafkaManager = KafkaManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRtaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMva2Fma2EvYWRtaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUNBQWlDO0FBRWpDLE1BQU0sRUFBQyxLQUFLLEVBQUMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFbkMsTUFBYSxZQUFZO0lBRXJCLGlDQUFpQyxDQUEyQjtJQUU1RCxLQUFLLENBQUMsSUFBSTtRQUNOLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDO1lBQ3BCLFFBQVEsRUFBRSwwQkFBMEI7WUFDcEMsUUFBUSxFQUFFLGtCQUFRLENBQUMsS0FBSztZQUN4QixPQUFPLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQztTQUNwQyxDQUFDLENBQUM7UUFDSCxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDNUIsTUFBTSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUM1QixLQUFLLENBQUMsWUFBWSxDQUFDO2dCQUNmLE1BQU0sRUFBRSxDQUFDLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxpQ0FBaUMsRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUFDLENBQUM7YUFDOUUsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUFqQkQsb0NBaUJDIn0=