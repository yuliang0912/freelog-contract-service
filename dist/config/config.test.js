"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kafkajs_1 = require("kafkajs");
exports.default = () => {
    const config = {};
    config.cluster = {
        listen: {
            port: 5109
        }
    };
    config.mongoose = {
        url: `mongodb://contract_service:QzA4Qzg3QTA3NDRCQTA0NDU1RUQxMjI3MTA4ODQ1MTk=@dds-wz9ac40fee5c09441.mongodb.rds.aliyuncs.com:3717,dds-wz9ac40fee5c09442.mongodb.rds.aliyuncs.com:3717/test-contracts?replicaSet=mgset-44484047`
    };
    config.kafka = {
        enable: true,
        clientId: 'freelog-contract-service',
        logLevel: kafkajs_1.logLevel.ERROR,
        brokers: ['kafka.development:9092'], // 'kafka-hs.production.svc.cluster.local:9092'
    };
    return config;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uZmlnL2NvbmZpZy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscUNBQWlDO0FBRWpDLGtCQUFlLEdBQUcsRUFBRTtJQUNoQixNQUFNLE1BQU0sR0FBUSxFQUFFLENBQUM7SUFFdkIsTUFBTSxDQUFDLE9BQU8sR0FBRztRQUNiLE1BQU0sRUFBRTtZQUNKLElBQUksRUFBRSxJQUFJO1NBQ2I7S0FDSixDQUFDO0lBRUYsTUFBTSxDQUFDLFFBQVEsR0FBRztRQUNkLEdBQUcsRUFBRSwwTkFBME47S0FDbE8sQ0FBQztJQUVGLE1BQU0sQ0FBQyxLQUFLLEdBQUc7UUFDWCxNQUFNLEVBQUUsSUFBSTtRQUNaLFFBQVEsRUFBRSwwQkFBMEI7UUFDcEMsUUFBUSxFQUFFLGtCQUFRLENBQUMsS0FBSztRQUN4QixPQUFPLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLCtDQUErQztLQUN2RixDQUFDO0lBRUYsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyxDQUFDIn0=