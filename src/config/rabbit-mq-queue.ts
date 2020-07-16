const RABBIT_MQ_QUEUES = [];

RABBIT_MQ_QUEUES.push({
    name: 'auth#contract-event-receive-queue',
    options: {autoDelete: false, durable: true},
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
    options: {autoDelete: false, durable: true},
    routingKeys: [
        {
            exchange: 'freelog-event-exchange',
            routingKey: 'register.event.completed'
        }
    ]
});

RABBIT_MQ_QUEUES.push({
    name: 'auth#release-scheme-bind-contract-queue',
    options: {autoDelete: false, durable: true},
    routingKeys: [
        {
            exchange: 'freelog-resource-exchange',
            routingKey: 'release.scheme.bindContract'
        }
    ]
});

RABBIT_MQ_QUEUES.push({
    name: 'auth#release-scheme-created-queue',
    options: {autoDelete: false, durable: true},
    routingKeys: [
        {
            exchange: 'freelog-resource-exchange',
            routingKey: 'release.scheme.created'
        }
    ]
});

RABBIT_MQ_QUEUES.push({
    name: 'auth#release-scheme-auth-changed-queue',
    options: {autoDelete: false, durable: true},
    routingKeys: [
        {
            exchange: 'freelog-contract-exchange',
            routingKey: 'auth.releaseScheme.authStatus.changed'
        }
    ]
});

RABBIT_MQ_QUEUES.push({
    name: 'auth#release-scheme-auth-reset-queue',
    options: {autoDelete: false, durable: true},
    routingKeys: [
        {
            exchange: 'freelog-contract-exchange',
            routingKey: 'auth.releaseScheme.authStatus.reset'
        }
    ]
});

RABBIT_MQ_QUEUES.push({
    name: 'auth#release-contract-auth-changed-queue',
    options: {autoDelete: false, durable: true},
    routingKeys: [
        {
            exchange: 'freelog-contract-exchange',
            routingKey: 'contract.1.contractStatus.changed'
        }
    ]
});

RABBIT_MQ_QUEUES.push({
    name: 'auth#release-scheme-generate-auth-info-queue',
    options: {autoDelete: false, durable: true},
    routingKeys: [
        {
            exchange: 'freelog-resource-exchange',
            routingKey: 'release.scheme.generateAuthInfo'
        }
    ]
});

RABBIT_MQ_QUEUES.push({
    name: 'auth#node-contract-auth-changed-queue',
    options: {autoDelete: false, durable: true},
    routingKeys: [
        {
            exchange: 'freelog-contract-exchange',
            routingKey: 'contract.2.contractStatus.changed'
        }
    ]
});

RABBIT_MQ_QUEUES.push({
    name: 'auth#presentable-created-queue',
    options: {autoDelete: false, durable: true},
    routingKeys: [
        {
            exchange: 'freelog-node-exchange',
            routingKey: 'node.presentable.created'
        }
    ]
});

RABBIT_MQ_QUEUES.push({
    name: 'auth#presentable-bind-contract-queue',
    options: {autoDelete: false, durable: true},
    routingKeys: [
        {
            exchange: 'freelog-node-exchange',
            routingKey: 'node.presentable.bindContract'
        }
    ]
});

RABBIT_MQ_QUEUES.push({
    name: 'auth#presentable-auth-reset-queue',
    options: {autoDelete: false, durable: true},
    routingKeys: [
        {
            exchange: 'freelog-contract-exchange',
            routingKey: 'auth.presentable.authStatus.reset'
        }
    ]
});

RABBIT_MQ_QUEUES.push({
    name: 'auth#presentable-version-locked-queue',
    options: {autoDelete: false, durable: true},
    routingKeys: [
        {
            exchange: 'freelog-node-exchange',
            routingKey: 'node.presentable.versionLocked'
        }
    ]
});

RABBIT_MQ_QUEUES.push({
    name: 'auth#presentable-generate-auth-info-queue',
    options: {autoDelete: false, durable: true},
    routingKeys: [
        {
            exchange: 'freelog-node-exchange',
            routingKey: 'node.presentable.generateAuthInfo'
        }
    ]
});

export const queues = RABBIT_MQ_QUEUES;
