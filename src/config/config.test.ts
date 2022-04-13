import {logLevel} from 'kafkajs';

export default () => {
    const config: any = {};

    config.cluster = {
        listen: {
            port: 5109
        }
    };

    config.mongoose = {
        url: `mongodb://contract_service:QzA4Qzg3QTA3NDRCQTA0NDU1RUQxMjI3MTA4ODQ1MTk=@dds-wz9ac40fee5c09441.mongodb.rds.aliyuncs.com:3717,dds-wz9ac40fee5c09442.mongodb.rds.aliyuncs.com:3717/test-contracts?replicaSet=mgset-44484047`
    };

    config.kafka = {
        enable: true,
        clientId: 'freelog-contract-service',
        logLevel: logLevel.ERROR,
        brokers: ['kafka-0.development:9092', 'kafka-1.development:9092', 'kafka-2.development:9092'], // 'kafka-hs.production.svc.cluster.local:9092'
    };

    return config;
};
