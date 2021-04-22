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
        url: 'mongodb://mongo-test.common:27017/contracts'
    };
    config.uploadConfig = {
        aliOss: {
            internal: true,
        },
        amzS3: {}
    };
    config.kafka = {
        enable: false,
        clientId: 'freelog-contract-service',
        logLevel: kafkajs_1.logLevel.ERROR,
        brokers: ['192.168.164.165:9090']
    };
    return config;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uZmlnL2NvbmZpZy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscUNBQWlDO0FBRWpDLGtCQUFlLEdBQUcsRUFBRTtJQUNoQixNQUFNLE1BQU0sR0FBUSxFQUFFLENBQUM7SUFFdkIsTUFBTSxDQUFDLE9BQU8sR0FBRztRQUNiLE1BQU0sRUFBRTtZQUNKLElBQUksRUFBRSxJQUFJO1NBQ2I7S0FDSixDQUFDO0lBRUYsTUFBTSxDQUFDLFFBQVEsR0FBRztRQUNkLEdBQUcsRUFBRSw2Q0FBNkM7S0FDckQsQ0FBQztJQUVGLE1BQU0sQ0FBQyxZQUFZLEdBQUc7UUFDbEIsTUFBTSxFQUFFO1lBQ0osUUFBUSxFQUFFLElBQUk7U0FDakI7UUFDRCxLQUFLLEVBQUUsRUFBRTtLQUNaLENBQUM7SUFFRixNQUFNLENBQUMsS0FBSyxHQUFHO1FBQ1gsTUFBTSxFQUFFLEtBQUs7UUFDYixRQUFRLEVBQUUsMEJBQTBCO1FBQ3BDLFFBQVEsRUFBRSxrQkFBUSxDQUFDLEtBQUs7UUFDeEIsT0FBTyxFQUFFLENBQUMsc0JBQXNCLENBQUM7S0FDcEMsQ0FBQztJQUVGLE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMsQ0FBQyJ9