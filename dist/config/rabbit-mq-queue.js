"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queues = void 0;
const RABBIT_MQ_QUEUES = [];
RABBIT_MQ_QUEUES.push({
    name: 'auth#contract-event-receive-queue',
    options: { autoDelete: false, durable: true },
    routingKeys: [
        {
            exchange: 'freelog-event-exchange',
            routingKey: 'event.contract.trigger'
        },
        {
            exchange: 'freelog-pay-exchange',
            routingKey: 'event.payment.order'
        }
    ]
});
RABBIT_MQ_QUEUES.push({
    name: 'auth#event-register-completed-queue',
    options: { autoDelete: false, durable: true },
    routingKeys: [
        {
            exchange: 'freelog-event-exchange',
            routingKey: 'register.event.completed'
        }
    ]
});
RABBIT_MQ_QUEUES.push({
    name: 'auth#release-scheme-bind-contract-queue',
    options: { autoDelete: false, durable: true },
    routingKeys: [
        {
            exchange: 'freelog-resource-exchange',
            routingKey: 'release.scheme.bindContract'
        }
    ]
});
RABBIT_MQ_QUEUES.push({
    name: 'auth#release-scheme-created-queue',
    options: { autoDelete: false, durable: true },
    routingKeys: [
        {
            exchange: 'freelog-resource-exchange',
            routingKey: 'release.scheme.created'
        }
    ]
});
RABBIT_MQ_QUEUES.push({
    name: 'auth#release-scheme-auth-changed-queue',
    options: { autoDelete: false, durable: true },
    routingKeys: [
        {
            exchange: 'freelog-contract-exchange',
            routingKey: 'auth.releaseScheme.authStatus.changed'
        }
    ]
});
RABBIT_MQ_QUEUES.push({
    name: 'auth#release-scheme-auth-reset-queue',
    options: { autoDelete: false, durable: true },
    routingKeys: [
        {
            exchange: 'freelog-contract-exchange',
            routingKey: 'auth.releaseScheme.authStatus.reset'
        }
    ]
});
RABBIT_MQ_QUEUES.push({
    name: 'auth#release-contract-auth-changed-queue',
    options: { autoDelete: false, durable: true },
    routingKeys: [
        {
            exchange: 'freelog-contract-exchange',
            routingKey: 'contract.1.contractStatus.changed'
        }
    ]
});
RABBIT_MQ_QUEUES.push({
    name: 'auth#release-scheme-generate-auth-info-queue',
    options: { autoDelete: false, durable: true },
    routingKeys: [
        {
            exchange: 'freelog-resource-exchange',
            routingKey: 'release.scheme.generateAuthInfo'
        }
    ]
});
RABBIT_MQ_QUEUES.push({
    name: 'auth#node-contract-auth-changed-queue',
    options: { autoDelete: false, durable: true },
    routingKeys: [
        {
            exchange: 'freelog-contract-exchange',
            routingKey: 'contract.2.contractStatus.changed'
        }
    ]
});
RABBIT_MQ_QUEUES.push({
    name: 'auth#presentable-created-queue',
    options: { autoDelete: false, durable: true },
    routingKeys: [
        {
            exchange: 'freelog-node-exchange',
            routingKey: 'node.presentable.created'
        }
    ]
});
RABBIT_MQ_QUEUES.push({
    name: 'auth#presentable-bind-contract-queue',
    options: { autoDelete: false, durable: true },
    routingKeys: [
        {
            exchange: 'freelog-node-exchange',
            routingKey: 'node.presentable.bindContract'
        }
    ]
});
RABBIT_MQ_QUEUES.push({
    name: 'auth#presentable-auth-reset-queue',
    options: { autoDelete: false, durable: true },
    routingKeys: [
        {
            exchange: 'freelog-contract-exchange',
            routingKey: 'auth.presentable.authStatus.reset'
        }
    ]
});
RABBIT_MQ_QUEUES.push({
    name: 'auth#presentable-version-locked-queue',
    options: { autoDelete: false, durable: true },
    routingKeys: [
        {
            exchange: 'freelog-node-exchange',
            routingKey: 'node.presentable.versionLocked'
        }
    ]
});
RABBIT_MQ_QUEUES.push({
    name: 'auth#presentable-generate-auth-info-queue',
    options: { autoDelete: false, durable: true },
    routingKeys: [
        {
            exchange: 'freelog-node-exchange',
            routingKey: 'node.presentable.generateAuthInfo'
        }
    ]
});
exports.queues = RABBIT_MQ_QUEUES;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFiYml0LW1xLXF1ZXVlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZy9yYWJiaXQtbXEtcXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7QUFFNUIsZ0JBQWdCLENBQUMsSUFBSSxDQUFDO0lBQ2xCLElBQUksRUFBRSxtQ0FBbUM7SUFDekMsT0FBTyxFQUFFLEVBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFDO0lBQzNDLFdBQVcsRUFBRTtRQUNUO1lBQ0ksUUFBUSxFQUFFLHdCQUF3QjtZQUNsQyxVQUFVLEVBQUUsd0JBQXdCO1NBQ3ZDO1FBQ0Q7WUFDSSxRQUFRLEVBQUUsc0JBQXNCO1lBQ2hDLFVBQVUsRUFBRSxxQkFBcUI7U0FDcEM7S0FDSjtDQUNKLENBQUMsQ0FBQztBQUVILGdCQUFnQixDQUFDLElBQUksQ0FBQztJQUNsQixJQUFJLEVBQUUscUNBQXFDO0lBQzNDLE9BQU8sRUFBRSxFQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBQztJQUMzQyxXQUFXLEVBQUU7UUFDVDtZQUNJLFFBQVEsRUFBRSx3QkFBd0I7WUFDbEMsVUFBVSxFQUFFLDBCQUEwQjtTQUN6QztLQUNKO0NBQ0osQ0FBQyxDQUFDO0FBRUgsZ0JBQWdCLENBQUMsSUFBSSxDQUFDO0lBQ2xCLElBQUksRUFBRSx5Q0FBeUM7SUFDL0MsT0FBTyxFQUFFLEVBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFDO0lBQzNDLFdBQVcsRUFBRTtRQUNUO1lBQ0ksUUFBUSxFQUFFLDJCQUEyQjtZQUNyQyxVQUFVLEVBQUUsNkJBQTZCO1NBQzVDO0tBQ0o7Q0FDSixDQUFDLENBQUM7QUFFSCxnQkFBZ0IsQ0FBQyxJQUFJLENBQUM7SUFDbEIsSUFBSSxFQUFFLG1DQUFtQztJQUN6QyxPQUFPLEVBQUUsRUFB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