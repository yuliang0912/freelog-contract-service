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
     * @param eventInfo
     * @param fromState
     * @param toState
     */
    async registerContractEvents(contractInfo, session, eventInfo, fromState, toState) {
        const toBeRegisterEventInfos = this.getCanRegisterEvents(contractInfo, toState);
        const alreadyRegisteredEventInfos = this.getCanRegisterEvents(contractInfo, fromState);
        if (!toBeRegisterEventInfos.length && !alreadyRegisteredEventInfos.length) {
            return;
        }
        const eventBody = toBeRegisterEventInfos.map(eventInfo => lodash_1.pick(eventInfo, ['service', 'name', 'code', 'eventId', 'args']));
        try {
            await this.kafkaClient.send({
                topic: 'contract-fsm-event-register-topic', acks: -1,
                messages: [{
                        key: contractInfo.contractId,
                        value: JSON.stringify(eventBody),
                        headers: { contractId: contractInfo.contractId, fromState, toState }
                    }]
            }).catch(error => this.errorHandle(contractInfo, session));
        }
        catch (error) {
            await this.errorHandle(contractInfo, session);
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZnNtLWV2ZW50LXRyYW5zaXRpb24tYWZ0ZXItaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cmFjdC1mc20tc2VydmljZS9jb250cmFjdC1mc20tZXZlbnQtdHJhbnNpdGlvbi1hZnRlci1oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBeUQ7QUFFekQsbUNBQW1DO0FBQ25DLGtDQUFzRTtBQUN0RSw0Q0FBNEM7QUFNNUMsSUFBYSxzQ0FBc0MsOENBQW5ELE1BQWEsc0NBQXNDO0lBTy9DOzs7Ozs7Ozs7O09BVUc7SUFDSCxLQUFLLENBQUMsc0JBQXNCLENBQUMsWUFBMEIsRUFBRSxPQUFzQixFQUFFLFNBQXVDLEVBQUUsU0FBaUIsRUFBRSxPQUFlO1FBRXhKLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNoRixNQUFNLDJCQUEyQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDdkYsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sSUFBSSxDQUFDLDJCQUEyQixDQUFDLE1BQU0sRUFBRTtZQUN2RSxPQUFPO1NBQ1Y7UUFDRCxNQUFNLFNBQVMsR0FBRyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxhQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzSCxJQUFJO1lBQ0EsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztnQkFDeEIsS0FBSyxFQUFFLG1DQUFtQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ3BELFFBQVEsRUFBRSxDQUFDO3dCQUNQLEdB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