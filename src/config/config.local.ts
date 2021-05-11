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
        url: `mongodb://contract_service:MTAwZGRhODU0Njc2MTM=@dds-wz9ac40fee5c09441604-pub.mongodb.rds.aliyuncs.com:3717,dds-wz9ac40fee5c09442584-pub.mongodb.rds.aliyuncs.com:3717/local-contracts?replicaSet=mgset-44484047`
    };

    // config.mongoose = {
    //     url: `mongodb://contract_service:QzA4Qzg3QTA3NDRCQTA0NDU1RUQxMjI3MTA4ODQ1MTk=@dds-wz9ac40fee5c09441604-pub.mongodb.rds.aliyuncs.com:3717,dds-wz9ac40fee5c09442584-pub.mongodb.rds.aliyuncs.com:3717/test-contracts?replicaSet=mgset-44484047`,
    // };
    // config.gatewayUrl = 'http://api.testfreelog.com';

    config.localIdentity = {
        userId: 50021,
        username: 'yuliang'
    };

    return config;
};
