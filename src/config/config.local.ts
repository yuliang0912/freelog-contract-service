import {logLevel} from 'kafkajs';

export const development = {
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

export default () => {
    const config: any = {};

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
        userId: 50017,
        username: 'yuliang'
    };

    config.kafka = {
        enable: false,
        clientId: 'freelog-contract-service',
        logLevel: logLevel.ERROR,
        brokers: ['192.168.164.165:9090']
    };


    return config;
};
