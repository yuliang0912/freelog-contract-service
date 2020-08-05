import { IOutsideServiceEventHandler } from '../interface';
export declare class RabbitMqSubscribeHandler {
    rabbitMq: any;
    rabbitClient: any;
    outsideServiceEventHandler: IOutsideServiceEventHandler;
    private readonly patrun;
    /**
     * 订阅配置中的队列
     */
    subscribe(): void;
    /**
     * 消息处理
     * @param message
     * @param headers
     * @param deliveryInfo
     * @param messageObject
     * @returns {Promise<void>}
     */
    messageHandle(message: any, headers: any, deliveryInfo: any, messageObject: any): Promise<void>;
    /**
     * 注册rabbitMq路由与系统对应的事件映射关系
     * @private
     */
    initial(): void;
}
