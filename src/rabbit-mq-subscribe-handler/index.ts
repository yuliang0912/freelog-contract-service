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

        if (!(this.rabbitMq?.enable ?? true)) {
            return;
        }

        const handlerFunc = this.messageHandle.bind(this);
        const subscribeQueues = () => this.rabbitMq.queues.forEach(({name}) => this.rabbitClient.subscribe(name, handlerFunc));

        if (this.rabbitClient.isReady) {
            subscribeQueues();
        } else {
            this.rabbitClient.on('ready', subscribeQueues);
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
    initial() {

        const eventRouteMap: Map<object, OutsideServiceEventEnum> = new Map();

        eventRouteMap.set({routingKey: 'event.contract.trigger'}, OutsideServiceEventEnum.RegisteredEventTriggerEvent);

        eventRouteMap.set({
            routingKey: 'event.payment.order', eventName: 'PaymentOrderTradeStatusChanged'
        }, OutsideServiceEventEnum.PaymentOrderStatusChangedEvent);

        eventRouteMap.set({
            routingKey: 'event.payment.order', eventName: 'TransferRecordTradeStatusChanged'
        }, OutsideServiceEventEnum.TransferRecordTradeStatusChangedEvent);

        eventRouteMap.set({
            routingKey: 'event.payment.order', eventName: 'inquirePaymentEvent'
        }, OutsideServiceEventEnum.InquirePaymentEvent);

        eventRouteMap.set({
            routingKey: 'event.payment.order', eventName: 'inquireTransferEvent'
        }, OutsideServiceEventEnum.InquireTransferEvent);

        eventRouteMap.forEach((value, key) => this.patrun.add(key, value));
    }
}
