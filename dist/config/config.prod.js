"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => {
    const config = {};
    config.cluster = {
        listen: {
            port: 7109
        }
    };
    config.mongoose = {
        url: decodeURIComponent('mongodb%3A%2F%2Fcontract_service%3AQzA4Qzg3QTA3NDRCQTA0NDU1RUQxMjI3MTA4ODQ1MTk%3D%40freelog-prod-public.mongodb.rds.aliyuncs.com%3A3717%2Cfreelog-prod-public-secondary.mongodb.rds.aliyuncs.com%3A3717%2Fprod-contracts%3FreplicaSet%3Dmgset-58730021')
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
        logLevel: 1,
        brokers: ['kafka-hs.production.svc.cluster.local:9092'],
        connectionTimeout: 3000,
        retry: {
            initialRetryTime: 5000,
            retries: 20
        }
    };
    return config;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLnByb2QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uZmlnL2NvbmZpZy5wcm9kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsa0JBQWUsR0FBRyxFQUFFO0lBQ2hCLE1BQU0sTUFBTSxHQUFRLEVBQUUsQ0FBQztJQUV2QixNQUFNLENBQUMsT0FBTyxHQUFHO1FBQ2IsTUFBTSxFQUFFO1lBQ0osSUFBSSxFQUFFLElBQUk7U0FDYjtLQUNKLENBQUM7SUFFRixNQUFNLENBQUMsUUFBUSxHQUFHO1FBQ2QsR0FBRyxFQUFFLGtCQUFrQixDQUFDLHdQQUF3UCxDQUFDO0tBQ3BSLENBQUM7SUFFRixNQUFNLENBQUMsWUFBWSxHQUFHO1FBQ2xCLE1BQU0sRUFBRTtZQUNKLFFBQVEsRUFBRSxJQUFJO1NBQ2pCO1FBQ0QsS0FBSyxFQUFFLEVBQUU7S0FDWixDQUFDO0lBRUYsTUFBTSxDQUFDLEtBQUssR0FBRztRQUNYLE1BQU0sRUFBRSxJQUFJO1FBQ1osUUFBUSxFQUFFLDBCQUEwQjtRQUNwQyxRQUFRLEVBQUUsQ0FBQztRQUNYLE9BQU8sRUFBRSxDQUFDLDRDQUE0QyxDQUFDO1FBQ3ZELGlCQUFpQixFQUFFLElBQUk7UUFDdkIsS0FBSyxFQUFFO1lBQ0gsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixPQUFPLEVBQUUsRUFBRTtTQUNkO0tBQ0osQ0FBQztJQUVGLE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMsQ0FBQyJ9