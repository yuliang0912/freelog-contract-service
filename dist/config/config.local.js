"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.development = void 0;
const kafkajs_1 = require("kafkajs");
exports.development = {
    watchDirs: [
        'app',
        'controller',
        'lib',
        'service',
        'extend',
        'config',
        'app.ts',
        'agent.ts',
        'interface.ts',
    ],
    overrideDefault: true
};
exports.default = () => {
    const config = {};
    config.cluster = {
        listen: {
            port: 7109
        }
    };
    config.middleware = ['errorAutoSnapHandler', 'gatewayIdentityInfoHandler', 'localIdentityInfoHandler'];
    config.mongoose = {
        url: decodeURIComponent(`mongodb%3A%2F%2Fcontract_service%3AMTAwZGRhODU0Njc2MTM%3D%40dds-wz9ac40fee5c09441604-pub.mongodb.rds.aliyuncs.com%3A3717%2Cdds-wz9ac40fee5c09442584-pub.mongodb.rds.aliyuncs.com%3A3717%2Flocal-contracts%3FreplicaSet%3Dmgset-44484047`)
    };
    config.mongoose = {
        url: decodeURIComponent(`mongodb%3A%2F%2Fcontract_service%3AQzA4Qzg3QTA3NDRCQTA0NDU1RUQxMjI3MTA4ODQ1MTk%3D%40dds-wz9ac40fee5c09441604-pub.mongodb.rds.aliyuncs.com%3A3717%2Cdds-wz9ac40fee5c09442584-pub.mongodb.rds.aliyuncs.com%3A3717%2Ftest-contracts%3FreplicaSet%3Dmgset-44484047`),
    };
    config.gatewayUrl = 'http://api.testfreelog.com';
    config.localIdentity = {
        userId: 50022,
        username: 'yuliang'
    };
    config.kafka = {
        enable: true,
        clientId: 'freelog-contract-service',
        logLevel: kafkajs_1.logLevel.ERROR,
        brokers: ['112.74.140.101:9094']
    };
    return config;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmxvY2FsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZy9jb25maWcubG9jYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUNBQWlDO0FBRXBCLFFBQUEsV0FBVyxHQUFHO0lBQ3ZCLFNBQVMsRUFBRTtRQUNQLEtBQUs7UUFDTCxZQUFZO1FBQ1osS0FBSztRQUNMLFNBQVM7UUFDVCxRQUFRO1FBQ1IsUUFBUTtRQUNSLFFBQVE7UUFDUixVQUFVO1FBQ1YsY0FBYztLQUNqQjtJQUNELGVBQWUsRUFBRSxJQUFJO0NBQ3hCLENBQUM7QUFFRixrQkFBZSxHQUFHLEVBQUU7SUFDaEIsTUFBTSxNQUFNLEdBQVEsRUFBRSxDQUFDO0lBRXZCLE1BQU0sQ0FBQyxPQUFPLEdBQUc7UUFDYixNQUFNLEVBQUU7WUFDSixJQUFJLEVBQUUsSUFBSTtTQUNiO0tBQ0osQ0FBQztJQUVGLE1BQU0sQ0FBQyxVQUFVLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRSw0QkFBNEIsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO0lBQ3ZHLE1BQU0sQ0FBQyxRQUFRLEdBQUc7UUFDZCxHQUFHLEVBQUUsa0JBQWtCLENBQUMseU9BQXlPLENBQUM7S0FDclEsQ0FBQztJQUVGLE1BQU0sQ0FBQyxRQUFRLEdBQUc7UUFDZCxHQUFHLEVBQUUsa0JBQWtCLENBQUMsZ1FBQWdRLENBQUM7S0FDNVIsQ0FBQztJQUNGLE1BQU0sQ0FBQyxVQUFVLEdBQUcsNEJBQTRCLENBQUM7SUFFakQsTUFBTSxDQUFDLGFBQWEsR0FBRztRQUNuQixNQUFNLEVBQUUsS0FBSztRQUNiLFFBQVEsRUFBRSxTQUFTO0tBQ3RCLENBQUM7SUFFRixNQUFNLENBQUMsS0FBSyxHQUFHO1FBQ1gsTUFBTSxFQUFFLElBQUk7UUFDWixRQUFRLEVBQUUsMEJBQTBCO1FBQ3BDLFFBQVEsRUFBRSxrQkFBUSxDQUFDLEtBQUs7UUFDeEIsT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUM7S0FDbkMsQ0FBQztJQUdGLE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMsQ0FBQyJ9