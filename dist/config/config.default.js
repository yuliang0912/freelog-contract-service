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
    config.middleware = ['errorAutoSnapHandler', 'gatewayIdentityInfoHandler'];
    config.static = {
        enable: false
    };
    config.onerror = {
        all(err, ctx) {
            ctx.type = 'application/json';
            ctx.body = JSON.stringify({ ret: 0, retCode: 1, msg: err.toString(), data: null });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmRlZmF1bHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uZmlnL2NvbmZpZy5kZWZhdWx0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsdURBQXlDO0FBRXpDLGtCQUFlLENBQUMsT0FBbUIsRUFBRSxFQUFFO0lBQ25DLE1BQU0sTUFBTSxHQUFRLEVBQUUsQ0FBQztJQUV2Qix1RUFBdUU7SUFDdkUsTUFBTSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBRTNCLE1BQU0sQ0FBQyxPQUFPLEdBQUc7UUFDYixNQUFNLEVBQUU7WUFDSixJQUFJLEVBQUUsSUFBSTtTQUNiO0tBQ0osQ0FBQztJQUVGLE1BQU0sQ0FBQyxJQUFJLEdBQUc7UUFDVixNQUFNLEVBQUUsSUFBSTtRQUNaLGFBQWEsRUFBRSxPQUFPO0tBQ3pCLENBQUM7SUFFRixNQUFNLENBQUMsVUFBVSxHQUFHLENBQUMsc0JBQXNCLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztJQUUzRSxNQUFNLENBQUMsTUFBTSxHQUFHO1FBQ1osTUFBTSxFQUFFLEtBQUs7S0FDaEIsQ0FBQztJQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUc7UUFDYixHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUc7WUFDUixHQUFHLENBQUMsSUFBSSxHQUFHLGtCQUFrQixDQUFDO1lBQzlCLEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1lBQ2pGLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO1FBQ3JCLENBQUM7S0FDSixDQUFDO0lBRUYsTUFBTSxDQUFDLFFBQVEsR0FBRztRQUNkLE1BQU0sRUFBRTtZQUNKLE1BQU0sRUFBRSxLQUFLO1NBQ2hCO1FBQ0QsSUFBSSxFQUFFO1lBQ0YsTUFBTSxFQUFFLEtBQUs7U0FDaEI7S0FDSixDQUFDO0lBRUYsTUFBTSxDQUFDLG9CQUFvQixHQUFHO1FBQzFCLFFBQVEsRUFBRSxJQUFJO1FBQ2QsU0FBUyxFQUFFLGtDQUFrQztRQUM3QyxVQUFVLEVBQUUsa0NBQWtDO0tBQ2pELENBQUM7SUFFRixNQUFNLENBQUMsZUFBZSxHQUFHLGtIQUFrSCxDQUFDO0lBRTVJLE1BQU0sQ0FBQyxRQUFRLEdBQUc7UUFDZCxXQUFXLEVBQUU7WUFDVCxhQUFhLEVBQUUsVUFBVTtZQUN6QixTQUFTLEVBQUUsRUFBRSxDQUFFLGFBQWE7U0FDL0I7UUFDRCxXQUFXLEVBQUU7WUFDVCxTQUFTLEVBQUUsSUFBSTtZQUNmLG9CQUFvQixFQUFFLEtBQUssQ0FBRSxZQUFZO1NBQzVDO1FBQ0QsUUFBUSxFQUFFO1lBQ04sSUFBSSxFQUFFLDJCQUEyQjtTQUNwQztRQUNELE1BQU0sRUFBTix3QkFBTTtLQUNULENBQUM7SUFFRixPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDLENBQUMifQ==