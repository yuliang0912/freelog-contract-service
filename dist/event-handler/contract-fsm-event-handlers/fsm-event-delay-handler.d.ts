import { IEventHandler } from '../../interface';
export declare class ContractFsmEventDelayHandler implements IEventHandler {
    /**
     * TODO: 当同一个合同的多个事件并发执行时,会遇到合同锁定的情况,导致无法并行执行.此时需要把后续的消息延后处理
     * TODO: 实现方案是给rabbitMQ加一个死信队列.通过设置过期事件.重新路由一个延迟事件消息的队列来处理此类事件
     * @returns {Promise<void>}
     */
    handle(): Promise<void>;
}
