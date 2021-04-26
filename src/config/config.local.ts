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

    config.localIdentity = {
        userId: 50021,
        username: 'yuliang'
    };

    return config;
};
