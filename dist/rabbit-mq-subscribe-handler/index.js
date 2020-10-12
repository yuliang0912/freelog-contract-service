"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMqSubscribeHandler = void 0;
const Patrun = require("patrun");
const midway_1 = require("midway");
const enum_1 = require("../enum");
let RabbitMqSubscribeHandler = class RabbitMqSubscribeHandler {
    constructor() {
        this.patrun = Patrun();
    }
    /**
     * 订阅配置中的队列
     */
    subscribe() {
        if (!(this.rabbitMq?.enable ?? true)) {
            return;
        }
        const handlerFunc = this.messageHandle.bind(this);
        const subscribeQueues = () => this.rabbitMq.queues.forEach(({ name }) => this.rabbitClient.subscribe(name, handlerFunc));
        if (this.rabbitClient.isReady) {
            subscribeQueues();
        }
        else {
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
        }
        else {
            console.log(`不能处理的未知事件,queueName:${deliveryInfo.queue},routingKey:${messageObject.routingKey},eventName:${headers.eventName}`);
        }
    }
    /**
     * 注册rabbitMq路由与系统对应的事件映射关系
     * @private
     */
    initial() {
        const eventRouteMap = new Map();
        eventRouteMap.set({ routingKey: 'event.contract.trigger' }, enum_1.OutsideServiceEventEnum.RegisteredEventTriggerEvent);
        eventRouteMap.set({
            routingKey: 'event.payment.order', eventName: 'PaymentOrderTradeStatusChanged'
        }, enum_1.OutsideServiceEventEnum.PaymentOrderStatusChangedEvent);
        eventRouteMap.set({
            routingKey: 'event.payment.order', eventName: 'TransferRecordTradeStatusChanged'
        }, enum_1.OutsideServiceEventEnum.TransferRecordTradeStatusChangedEvent);
        eventRouteMap.set({
            routingKey: 'event.payment.order', eventName: 'inquirePaymentEvent'
        }, enum_1.OutsideServiceEventEnum.InquirePaymentEvent);
        eventRouteMap.set({
            routingKey: 'event.payment.order', eventName: 'inquireTransferEvent'
        }, enum_1.OutsideServiceEventEnum.InquireTransferEvent);
        eventRouteMap.forEach((value, key) => this.patrun.add(key, value));
    }
};
__decorate([
    midway_1.config(),
    __metadata("design:type", Object)
], RabbitMqSubscribeHandler.prototype, "rabbitMq", void 0);
__decorate([
    midway_1.plugin(),
    __metadata("design:type", Object)
], RabbitMqSubscribeHandler.prototype, "rabbitClient", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], RabbitMqSubscribeHandler.prototype, "outsideServiceEventHandler", void 0);
__decorate([
    midway_1.init(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RabbitMqSubscribeHandler.prototype, "initial", null);
RabbitMqSubscribeHandler = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('rabbitMqSubscribeHandler')
], RabbitMqSubscribeHandler);
exports.RabbitMqSubscribeHandler = RabbitMqSubscribeHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcmFiYml0LW1xLXN1YnNjcmliZS1oYW5kbGVyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLGlDQUFpQztBQUNqQyxtQ0FBb0U7QUFDcEUsa0NBQWdEO0FBS2hELElBQWEsd0JBQXdCLEdBQXJDLE1BQWEsd0JBQXdCO0lBQXJDO1FBU3FCLFdBQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQztJQXdFdkMsQ0FBQztJQXRFRzs7T0FFRztJQUNILFNBQVM7UUFFTCxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sSUFBSSxJQUFJLENBQUMsRUFBRTtZQUNsQyxPQUFPO1NBQ1Y7UUFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsRCxNQUFNLGVBQWUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFDLElBQUksRUFBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUV2SCxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFO1lBQzNCLGVBQWUsRUFBRSxDQUFDO1NBQ3JCO2FBQU07WUFDSCxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUM7U0FDbEQ7SUFDTCxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsYUFBYTtRQUU3RCxNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQzFDLFNBQVMsRUFBRSxZQUFZLENBQUMsS0FBSztZQUM3QixVQUFVLEVBQUUsYUFBYSxDQUFDLFVBQVU7WUFDcEMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTO1NBQy9CLENBQUMsQ0FBQztRQUNILElBQUksb0JBQW9CLEVBQUU7WUFDdEIsTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUMsTUFBTSxDQUFDLG9CQUFvQixFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1NBQ3JIO2FBQU07WUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixZQUFZLENBQUMsS0FBSyxlQUFlLGFBQWEsQ0FBQyxVQUFVLGNBQWMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7U0FDbEk7SUFDTCxDQUFDO0lBRUQ7OztPQUdHO0lBRUgsT0FBTztRQUVILE1BQU0sYUFBYSxHQUF5QyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRXRFLGFBQWEsQ0FBQyxHQUFHLENBQUMsRUFBQyxVQUFVLEVBQUUsd0JBQXdCLEVBQUMsRUFBRSw4QkFBdUIsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1FBRS9HLGFBQWEsQ0FBQyxHQUFHLENBQUM7WUFDZCxVQUFVLEVBQUUscUJBQXFCLEVBQUUsU0FBUyxFQUFFLGdDQUFnQztTQUNqRixFQUFFLDhCQUF1QixDQUFDLDhCQUE4QixDQUFDLENBQUM7UUFFM0QsYUFBYSxDQUFDLEdBQUcsQ0FBQztZQUNkLFVBQVUsRUFBRSxxQkFBcUIsRUFBRSxTQUFTLEVBQUUsa0NBQWtDO1NBQ25GLEVBQUUsOEJBQXVCLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUVsRSxhQUFhLENBQUMsR0FBRyxDQUFDO1lBQ2QsVUFBVSxFQUFFLHFCQUFxQixFQUFFLFNBQVMsRUFBRSxxQkFBcUI7U0FDdEUsRUFBRSw4QkFBdUIsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBRWhELGFBQWEsQ0FBQyxHQUFHLENBQUM7WUFDZCxVQUFVLEVBQUUscUJBQXFCLEVBQUUsU0FBUyxFQUFFLHNCQUFzQjtTQUN2RSxFQUFFLDhCQUF1QixDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFFakQsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7Q0FDSixDQUFBO0FBOUVHO0lBREMsZUFBTSxFQUFFOzswREFDQTtBQUVUO0lBREMsZUFBTSxFQUFFOzs4REFDSTtBQUViO0lBREMsZUFBTSxFQUFFOzs0RUFDK0M7QUFrRHhEO0lBREMsYUFBSSxFQUFFOzs7O3VEQXdCTjtBQWhGUSx3QkFBd0I7SUFGcEMsY0FBSyxDQUFDLFdBQVcsQ0FBQztJQUNsQixnQkFBTyxDQUFDLDBCQUEwQixDQUFDO0dBQ3ZCLHdCQUF3QixDQWlGcEM7QUFqRlksNERBQXdCIn0=