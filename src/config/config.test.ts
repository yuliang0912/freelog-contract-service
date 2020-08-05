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

    return config;
};
