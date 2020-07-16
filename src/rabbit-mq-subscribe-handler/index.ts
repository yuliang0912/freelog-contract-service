import * as Patrun from 'patrun';
import {provide, config, plugin, scope, inject, init} from 'midway';
import {OutsideServiceEventEnum} from '../enum';
import {IOutsideServiceEventHandler} from '../interface';

@scope('Singleton')
@provide('rabbitMqSubscribeHandler')
export class RabbitMqSubscribeHandler {

    @config()
    rabbitMq;
    @plugin()
    rabbitClient;
    @inject()
    outsideServiceEventHandler: IOutsideServiceEventHandler;

    private readonly patrun = Patrun();

    /**
     * 订阅配置中的队列
     */
    subscribe() {
        const handlerFunc = this.messageHandle.bind(this);
        const subscribeQueue = () => {
            this.rabbitMq.queues.forEach(({name}) => this.rabbitClient.subscribe(name, handlerFunc));
        };
        if (this.rabbitClient.isReady) {
            subscribeQueue();
        } else {
            this.rabbitClient.on('ready', subscribeQueue);
        }
    }

    /**
     * 消息处理
     * @param message
     * @param headers
     * @param deliveryInfo
     * @param messageObject
     * @returns {Promise<void>}
     */
    async messageHandle(message, headers, deliveryInfo, messageObject) {

        const givenHandleEventName = this.patrun.find({
            queueName: deliveryInfo.queue,
            routingKey: messageObject.routingKey,
            eventName: headers.eventName
        });
        if (givenHandleEventName) {
            await this.outsideServiceEventHandler.handle(givenHandleEventName, message, headers, deliveryInfo, messageObject);
        } else {
            console.log(`不能处理的未知事件,queueName:${deliveryInfo.queue},routingKey:${messageObject.routingKey},eventName:${headers.eventName}`);
        }
    }

    /**
     * 注册rabbitMq路由与系统对应的事件映射关系
     * @private
     */
    @init()
    __registerEventMap() {

        const {patrun} = this;

        patrun.add({routingKey: 'event.contract.trigger'}, OutsideServiceEventEnum.RegisteredEventTriggerEvent);

        patrun.add({
            routingKey: 'event.payment.order',
            eventName: 'PaymentOrderTradeStatusChanged'
        }, OutsideServiceEventEnum.PaymentOrderStatusChangedEvent);

        patrun.add({
            routingKey: 'event.payment.order',
            eventName: 'TransferRecordTradeStatusChanged'
        }, OutsideServiceEventEnum.TransferRecordTradeStatusChangedEvent);

        patrun.add({
            routingKey: 'event.payment.order',
            eventName: 'inquirePaymentEvent'
        }, OutsideServiceEventEnum.InquirePaymentEvent);

        patrun.add({
            routingKey: 'event.payment.order',
            eventName: 'inquireTransferEvent'
        }, OutsideServiceEventEnum.InquireTransferEvent);

        patrun.add({
            routingKey: 'release.scheme.created',
            eventName: 'releaseSchemeCreatedEvent'
        }, OutsideServiceEventEnum.ReleaseSchemeCreateEvent);

        patrun.add({
            routingKey: 'release.scheme.bindContract', eventName: 'releaseSchemeBindContractEvent'
        }, OutsideServiceEventEnum.ReleaseSchemeBindContractEvent);

        patrun.add({
            routingKey: 'auth.releaseScheme.authStatus.changed', eventName: 'releaseSchemeAuthChangedEvent'
        }, OutsideServiceEventEnum.ReleaseSchemeAuthChangedEvent);

        patrun.add({
            routingKey: 'auth.releaseScheme.authStatus.reset', eventName: 'releaseSchemeAuthResultResetEvent'
        }, OutsideServiceEventEnum.ReleaseSchemeAuthResetEvent);

        patrun.add({
            routingKey: 'contract.1.contractStatus.changed', eventName: 'contractAuthChangedEvent'
        }, OutsideServiceEventEnum.ReleaseContractAuthChangedEvent);

        patrun.add({
            routingKey: 'contract.2.contractStatus.changed', eventName: 'contractAuthChangedEvent'
        }, OutsideServiceEventEnum.NodeContractAuthChangedEvent);

        patrun.add({
            routingKey: 'node.presentable.created', eventName: 'presentableCreatedEvent'
        }, OutsideServiceEventEnum.PresentableCreatedEvent);
    }
}
