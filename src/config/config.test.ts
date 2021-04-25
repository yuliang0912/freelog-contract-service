import {logLevel} from 'kafkajs';

export default () => {
    const config: any = {};

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
        enable: true,
        clientId: 'freelog-contract-service',
        logLevel: logLevel.ERROR,
        brokers: ['kafka-svc.common:9093']
    };

    return config;
};
