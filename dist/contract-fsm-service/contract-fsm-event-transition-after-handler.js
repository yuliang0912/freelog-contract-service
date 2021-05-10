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
        if (lodash_1.isEmpty(toBeRegisterEventInfos.length)) {
            return;
        }
        const eventBody = toBeRegisterEventInfos.map(eventInfo => lodash_1.pick(eventInfo, ['service', 'name', 'code', 'eventId', 'args']));
        try {
            await this.sendContractRegisterEventToKafka(contractInfo, eventBody).catch(error => this.errorHandle(contractInfo, session));
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
        if (!fsmDescriptionInfo?.transition) {
            return toBeRegisterEventInfos;
        }
        lodash_1.forIn(fsmDescriptionInfo.transition, (eventInfo) => {
            if (ContractFsmEventTransitionAfterHandler_1.AllowRegisterEvents.includes(eventInfo.code)) {
                toBeRegisterEventInfos.push(eventInfo);
            }
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZnNtLWV2ZW50LXRyYW5zaXRpb24tYWZ0ZXItaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cmFjdC1mc20tc2VydmljZS9jb250cmFjdC1mc20tZXZlbnQtdHJhbnNpdGlvbi1hZnRlci1oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBeUQ7QUFFekQsbUNBQTRDO0FBQzVDLGtDQUFzRTtBQUN0RSw0Q0FBNEM7QUFNNUMsSUFBYSxzQ0FBc0MsOENBQW5ELE1BQWEsc0NBQXNDO0lBTy9DOzs7Ozs7Ozs7T0FTRztJQUNILEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxZQUEwQixFQUFFLE9BQXNCLEVBQUUsU0FBaUIsRUFBRSxPQUFlO1FBRS9HLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNoRixJQUFJLGdCQUFPLENBQUMsc0JBQXNCLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDeEMsT0FBTztTQUNWO1FBQ0QsTUFBTSxTQUFTLEdBQUcsc0JBQXNCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsYUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0gsSUFBSTtZQUNBLE1BQU0sSUFBSSxDQUFDLGdDQUFnQyxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQ2hJO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFD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