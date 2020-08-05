"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rabbit_mq_queue_1 = require("./rabbit-mq-queue");
exports.default = (appInfo) => {
    const config = {};
    // use for cookie sign key, should change to your own and keep security
    config.keys = appInfo.name;
    config.cluster = {
        listen: {
            port: 7109
        }
    };
    config.i18n = {
        enable: true,
        defaultLocale: 'zh-CN'
    };
    config.middleware = [
        'errorHandler', 'identityAuthentication'
    ];
    config.static = {
        enable: false
    };
    config.onerror = {
        all(err, ctx) {
            ctx.type = 'application/json';
            ctx.body = JSON.stringify({ ret: -1, msg: err.toString(), data: null });
            ctx.status = 500;
        }
    };
    config.security = {
        xframe: {
            enable: false,
        },
        csrf: {
            enable: false,
        }
    };
    config.clientCredentialInfo = {
        clientId: 1007,
        publicKey: '867145af1fdcf146725d5cc4a90f6a3b',
        privateKey: '8b347f9a1f1fcdfec1c80b917a0f4121'
    };
    config.contractSignKey = 'T0RZM01UUTFZV1l4Wm1SalpqRTBOamN5TldRMVkyTTBZVGt3WmpaaE0ySm1aSE5oWm1SellXWmtjMkZtWkhOaE5ETXlORE15TkRZMU16STJOVFF6';
    config.rabbitMq = {
        connOptions: {
            authMechanism: 'AMQPLAIN',
            heartbeat: 60 // 每2分钟保持一次连接
        },
        implOptions: {
            reconnect: true,
            reconnectBackoffTime: 20000 // 10秒尝试连接一次
        },
        exchange: {
            name: 'freelog-contract-exchange',
        },
        queues: rabbit_mq_queue_1.queues
    };
    return config;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmRlZmF1bHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uZmlnL2NvbmZpZy5kZWZhdWx0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsdURBQXlDO0FBRXpDLGtCQUFlLENBQUMsT0FBbUIsRUFBRSxFQUFFO0lBQ25DLE1BQU0sTUFBTSxHQUFRLEVBQUUsQ0FBQztJQUV2Qix1RUFBdUU7SUFDdkUsTUFBTSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBRTNCLE1BQU0sQ0FBQyxPQUFPLEdBQUc7UUFDYixNQUFNLEVBQUU7WUFDSixJQUFJLEVBQUUsSUFBSTtTQUNiO0tBQ0osQ0FBQztJQUVGLE1BQU0sQ0FBQyxJQUFJLEdBQUc7UUFDVixNQUFNLEVBQUUsSUFBSTtRQUNaLGFBQWEsRUFBRSxPQUFPO0tBQ3pCLENBQUM7SUFFRixNQUFNLENBQUMsVUFBVSxHQUFHO1FBQ2hCLGNBQWMsRUFBRSx3QkFBd0I7S0FDM0MsQ0FBQztJQUVGLE1BQU0sQ0FBQyxNQUFNLEdBQUc7UUFDWixNQUFNLEVBQUUsS0FBSztLQUNoQixDQUFDO0lBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRztRQUNiLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRztZQUNSLEdBQUcsQ0FBQyxJQUFJLEdBQUcsa0JBQWtCLENBQUM7WUFDOUIsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7WUFDdEUsR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7UUFDckIsQ0FBQztLQUNKLENBQUM7SUFFRixNQUFNLENBQUMsUUFBUSxHQUFHO1FBQ2QsTUFBTSxFQUFFO1lBQ0osTUFBTSxFQUFFLEtBQUs7U0FDaEI7UUFDRCxJQUFJLEVBQUU7WUFDRixNQUFNLEVBQUUsS0FBSztTQUNoQjtLQUNKLENBQUM7SUFFRixNQUFNLENBQUMsb0JBQW9CLEdBQUc7UUFDMUIsUUFBUSxFQUFFLElBQUk7UUFDZCxTQUFTLEVBQUUsa0NBQWtDO1FBQzdDLFVBQVUsRUFBRSxrQ0FBa0M7S0FDakQsQ0FBQztJQUVGLE1BQU0sQ0FBQyxlQUFlLEdBQUcsa0hBQWtILENBQUM7SUFFNUksTUFBTSxDQUFDLFFBQVEsR0FBRztRQUNkLFdBQVcsRUFBRTtZQUNULGFBQWEsRUFBRSxVQUFVO1lBQ3pCLFNBQVMsRUFBRSxFQUFFLENBQUUsYUFBYTtTQUMvQjtRQUNELFdBQVcsRUFBRTtZQUNULFNBQVMsRUFBRSxJQUFJO1lBQ2Ysb0JBQW9CLEVBQUUsS0FBSyxDQUFFLFlBQVk7U0FDNUM7UUFDRCxRQUFRLEVBQUU7WUFDTixJQUFJLEVBQUUsMkJBQTJCO1NBQ3BDO1FBQ0QsTUFBTSxFQUFOLHdCQUFNO0tBQ1QsQ0FBQztJQUVGLE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMsQ0FBQyJ9