import {EggAppInfo} from 'midway';
import {queues} from './rabbit-mq-queue';

export default (appInfo: EggAppInfo) => {
    const config: any = {};

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
            ctx.body = JSON.stringify({ret: -1, msg: err.toString(), data: null});
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
            heartbeat: 60  // 每2分钟保持一次连接
        },
        implOptions: {
            reconnect: true,
            reconnectBackoffTime: 20000  // 10秒尝试连接一次
        },
        exchange: {
            name: 'freelog-contract-exchange',
        },
        queues
    };

    return config;
};
