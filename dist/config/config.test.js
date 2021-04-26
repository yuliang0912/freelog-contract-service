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
        url: `mongodb://contract_service:QzA4Qzg3QTA3NDRCQTA0NDU1RUQxMjI3MTA4ODQ1MTk=@dds-wz9ac40fee5c09441604-pub.mongodb.rds.aliyuncs.com:3717,dds-wz9ac40fee5c09442584-pub.mongodb.rds.aliyuncs.com:3717/test-contracts?replicaSet=mgset-44484047`
    };
    config.uploadConfig = {
        aliOss: {
            internal: true,
        },
        amzS3: {}
    };
    config.kafka = {
        enable: true,
        clientId: 'freelog-contract-service',
        logLevel: kafkajs_1.logLevel.ERROR,
        brokers: ['kafka-svc.common:9093']
    };
    return config;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uZmlnL2NvbmZpZy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscUNBQWlDO0FBRWpDLGtCQUFlLEdBQUcsRUFBRTtJQUNoQixNQUFNLE1BQU0sR0FBUSxFQUFFLENBQUM7SUFFdkIsTUFBTSxDQUFDLE9BQU8sR0FBRztRQUNiLE1BQU0sRUFBRTtZQUNKLElBQUksRUFBRSxJQUFJO1NBQ2I7S0FDSixDQUFDO0lBRUYsTUFBTSxDQUFDLFFBQVEsR0FBRztRQUNkLEdBQUcsRUFBRSx3T0FBd087S0FDaFAsQ0FBQztJQUVGLE1BQU0sQ0FBQyxZQUFZLEdBQUc7UUFDbEIsTUFBTSxFQUFFO1lBQ0osUUFBUSxFQUFFLElBQUk7U0FDakI7UUFDRCxLQUFLLEVBQUUsRUFBRTtLQUNaLENBQUM7SUFFRixNQUFNLENBQUMsS0FBSyxHQUFHO1FBQ1gsTUFBTSxFQUFFLElBQUk7UUFDWixRQUFRLEVBQUUsMEJBQTBCO1FBQ3BDLFFBQVEsRUFBRSxrQkFBUSxDQUFDLEtBQUs7UUFDeEIsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUM7S0FDckMsQ0FBQztJQUVGLE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMsQ0FBQyJ9