export default () => {
    const config: any = {};

    config.cluster = {
        listen: {
            port: 7109
        }
    };

    config.mongoose = {
        url: 'mongodb://mongo-prod.common:27017/contracts'
    };

    config.uploadConfig = {
        aliOss: {
            internal: true,
        },
        amzS3: {}
    };

    config.rabbitMq = {
        connOptions: {
            host: 'rabbitmq-prod.common',
            port: 5672,
            login: 'prod_user_auth',
            password: 'rabbit@freelog',
            authMechanism: 'AMQPLAIN'
        },
    };

    return config;
};
