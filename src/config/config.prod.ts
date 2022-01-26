import {logLevel} from 'kafkajs';

export default () => {
    const config: any = {};

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
        logLevel: logLevel.ERROR,
        brokers: ['kafka-temp.common:9092']
    };

    return config;
};
