"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => {
    const config = {};
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
    config.rabbitMq = {
        connOptions: {
            host: 'rabbitmq-test.common',
            port: 5672,
            login: 'test_user_auth',
            password: 'rabbit@freelog',
            authMechanism: 'AMQPLAIN'
        },
    };
    return config;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uZmlnL2NvbmZpZy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsa0JBQWUsR0FBRyxFQUFFO0lBQ2hCLE1BQU0sTUFBTSxHQUFRLEVBQUUsQ0FBQztJQUV2QixNQUFNLENBQUMsT0FBTyxHQUFHO1FBQ2IsTUFBTSxFQUFFO1lBQ0osSUFBSSxFQUFFLElBQUk7U0FDYjtLQUNKLENBQUM7SUFFRixNQUFNLENBQUMsUUFBUSxHQUFHO1FBQ2QsR0FBRyxFQUFFLDZDQUE2QztLQUNyRCxDQUFDO0lBRUYsTUFBTSxDQUFDLFlBQVksR0FBRztRQUNsQixNQUFNLEVBQUU7WUFDSixRQUFRLEVBQUUsSUFBSTtTQUNqQjtRQUNELEtBQUssRUFBRSxFQUFFO0tBQ1osQ0FBQztJQUVGLE1BQU0sQ0FBQyxRQUFRLEdBQUc7UUFDZCxXQUFXLEVBQUU7WUFDVCxJQUFJLEVBQUUsc0JBQXNCO1lBQzVCLElBQUksRUFBRSxJQUFJO1lBQ1YsS0FBSyxFQUFFLGdCQUFnQjtZQUN2QixRQUFRLEVBQUUsZ0JBQWdCO1lBQzFCLGFBQWEsRUFBRSxVQUFVO1NBQzVCO0tBQ0osQ0FBQztJQUVGLE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMsQ0FBQyJ9