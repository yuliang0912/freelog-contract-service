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

    config.middleware = [
        'errorHandler', 'localUserIdentity'
    ];

    config.mongoose = {
        url: 'mongodb://127.0.0.1:27017/contracts'
    };

    config.localIdentity = {
        userId: 50021,
        username: 'yuliang'
    };

    config.rabbitMq = {
        enable: false,
        connOptions: {
            host: '192.168.164.165',
            port: 5672,
            login: 'guest',
            password: 'guest',
            authMechanism: 'AMQPLAIN',
        },
    };

    return config;
};
