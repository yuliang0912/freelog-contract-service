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
        enable: false,
        clientId: 'freelog-contract-service',
        logLevel: logLevel.ERROR,
        brokers: ['192.168.164.165:9090']
    };

    return config;
};
