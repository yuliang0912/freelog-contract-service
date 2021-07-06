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
var ContractFsmEventTransitionAfterHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractFsmEventTransitionAfterHandler = void 0;
const midway_1 = require("midway");
const lodash_1 = require("lodash");
const enum_1 = require("../enum");
const client_1 = require("../kafka/client");
let ContractFsmEventTransitionAfterHandler = ContractFsmEventTransitionAfterHandler_1 = class ContractFsmEventTransitionAfterHandler {
    /**
     * 注册合同新状态下需要侦听的事件(注册业务同时会取消注册之前的事件)
     * 分析当前状态下需要侦听的所有事件集,一次发送注册. 事件中心会先取消之前注册的事件集,然后重新注册新的事件集
     * 如果mq发送消息失败,并不影响本次合约的状态变更.而是修改合约状态,直到定时job把事件注册成功为止
     * 注册失败时,合约无法接受其他事件,直到合约注册成功为止
     * @param contractInfo
     * @param session
     * @param fromState
     * @param toState
     */
    async registerContractEvents(contractInfo, session, fromState, toState) {
        const toBeRegisterEventInfos = this.getCanRegisterEvents(contractInfo, toState);
        if (lodash_1.isEmpty(toBeRegisterEventInfos)) {
            return;
        }
        const eventBody = toBeRegisterEventInfos.map(eventInfo => lodash_1.pick(eventInfo, ['service', 'name', 'code', 'eventId', 'args']));
        try {
            await this.sendContractRegisterEventToKafka(contractInfo, eventBody).catch(() => this.errorHandle(contractInfo, session));
        }
        catch (error) {
            await this.errorHandle(contractInfo, session);
        }
    }
    /**
     * 发送合约注册事件到消息队列
     * @param contractInfo
     * @param eventBody
     */
    async sendContractRegisterEventToKafka(contractInfo, eventBody) {
        return this.kafkaClient.send({
            topic: 'contract-fsm-event-register-topic', acks: -1,
            messages: [{
                    key: contractInfo.contractId,
                    value: JSON.stringify(eventBody),
                    headers: { contractId: contractInfo.contractId }
                }]
        });
    }
    /**
     * 交易事件处理
     * @param contractInfo
     * @param session
     * @param eventInfo
     * @param transitionStateId
     */
    async [`exec${enum_1.PolicyEventEnum.TransactionEvent}Handle`](contractInfo, session, eventInfo, transitionStateId) {
        const messageBody = {
            transactionRecordId: eventInfo.args.transactionRecordId,
            transactionStatus: 2, stateId: transitionStateId ?? ''
        };
        return this.kafkaClient.send({
            topic: 'contract-payment-confirm-result-topic', acks: -1,
            messages: [{
                    value: JSON.stringify(messageBody), headers: { signature: '' }
                }]
        }).then(() => console.log('交易确认消息发送成功'));
    }
    /**
     * 获取可以注册的事件集
     * @param contractInfo
     * @param state
     */
    getCanRegisterEvents(contractInfo, state) {
        const toBeRegisterEventInfos = [];
        const fsmDescriptionInfo = contractInfo.policyInfo.fsmDescriptionInfo[state];
        for (const eventInfo of fsmDescriptionInfo?.transitions) {
            if (ContractFsmEventTransitionAfterHandler_1.AllowRegisterEvents.includes(eventInfo.code)) {
                toBeRegisterEventInfos.push(eventInfo);
            }
        }
        return toBeRegisterEventInfos;
    }
    /**
     * 错误处理,事件注册失败,可以通过后续的job重新尝试注册.注册成功之前,不允许合约执行其他事件
     * @param contractInfo
     * @param session
     */
    errorHandle(contractInfo, session) {
        console.log('事件注册失败,后续job会尝试重新注册');
        return this.contractInfoProvider.updateOne({ _id: contractInfo.contractId }, {
            fsmRunningStatus: enum_1.ContractFsmRunningStatusEnum.ToBeRegisteredEvents
        }, { session });
    }
    /**
     * 允许注册的事件集
     * @constructor
     */
    static get AllowRegisterEvents() {
        return [enum_1.PolicyEventEnum.EndOfCycleEvent, enum_1.PolicyEventEnum.AbsolutelyTimeEvent, enum_1.PolicyEventEnum.RelativeTimeEvent];
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", client_1.KafkaClient)
], ContractFsmEventTransitionAfterHandler.prototype, "kafkaClient", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractFsmEventTransitionAfterHandler.prototype, "contractInfoProvider", void 0);
ContractFsmEventTransitionAfterHandler = ContractFsmEventTransitionAfterHandler_1 = __decorate([
    midway_1.provide(),
    midway_1.scope(midway_1.ScopeEnum.Singleton)
], ContractFsmEventTransitionAfterHandler);
exports.ContractFsmEventTransitionAfterHandler = ContractFsmEventTransitionAfterHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZnNtLWV2ZW50LXRyYW5zaXRpb24tYWZ0ZXItaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cmFjdC1mc20tc2VydmljZS9jb250cmFjdC1mc20tZXZlbnQtdHJhbnNpdGlvbi1hZnRlci1oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBeUQ7QUFFekQsbUNBQXFDO0FBQ3JDLGtDQUFzRTtBQUN0RSw0Q0FBNEM7QUFNNUMsSUFBYSxzQ0FBc0MsOENBQW5ELE1BQWEsc0NBQXNDO0lBTy9DOzs7Ozs7Ozs7T0FTRztJQUNILEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxZQUEwQixFQUFFLE9BQXNCLEVBQUUsU0FBaUIsRUFBRSxPQUFlO1FBRS9HLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNoRixJQUFJLGdCQUFPLENBQUMsc0JBQXNCLENBQUMsRUFBRTtZQUNqQyxPQUFPO1NBQ1Y7UUFDRCxNQUFNLFNBQVMsR0FBRyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxhQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzSCxJQUFJO1lBQ0EsTUFBTSxJQUFJLENBQUMsZ0NBQWdDLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQzdIO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ2pEO0lBQ0wsQ0FB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