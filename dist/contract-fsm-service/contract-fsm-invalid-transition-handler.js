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
exports.ContractFsmInvalidTransitionHandler = void 0;
const enum_1 = require("../enum");
const client_1 = require("../kafka/client");
const midway_1 = require("midway");
const contract_invalid_transition_record_provider_1 = require("../app/data-provider/contract-invalid-transition-record-provider");
let ContractFsmInvalidTransitionHandler = class ContractFsmInvalidTransitionHandler {
    /**
     * 无效事件记录
     * @param contractInfo
     * @param session
     * @param eventInfo
     * @param remark
     */
    async invalidTransitionHandle(contractInfo, session, eventInfo, remark) {
        const model = {
            contractId: contractInfo.contractId,
            contractState: contractInfo.fsmCurrentState,
            eventId: eventInfo?.eventId ?? '',
            eventCode: eventInfo?.code ?? '',
            triggerDate: eventInfo?.eventTime ?? new Date(),
            eventInfo, remark
        };
        await this.contractInvalidTransitionRecordProvider.create([model], { session });
    }
    /**
     * 交易事件状态无法流转处理(需要通知支付中心)
     * @param contractInfo
     * @param session
     * @param eventInfo
     */
    async [`exec${enum_1.PolicyEventEnum.TransactionEvent}InvalidEventHandle`](contractInfo, session, eventInfo) {
        const messageBody = { transactionRecordId: eventInfo.args.transactionRecordId, transactionStatus: 3 };
        await this.kafkaClient.send({
            topic: 'contract-payment-confirm-result--topic', acks: -1,
            messages: [{
                    value: JSON.stringify(messageBody),
                    headers: { signature: '' }
                }]
        });
        return true;
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", client_1.KafkaClient)
], ContractFsmInvalidTransitionHandler.prototype, "kafkaClient", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", contract_invalid_transition_record_provider_1.default)
], ContractFsmInvalidTransitionHandler.prototype, "contractInvalidTransitionRecordProvider", void 0);
ContractFsmInvalidTransitionHandler = __decorate([
    midway_1.provide(),
    midway_1.scope(midway_1.ScopeEnum.Singleton)
], ContractFsmInvalidTransitionHandler);
exports.ContractFsmInvalidTransitionHandler = ContractFsmInvalidTransitionHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZnNtLWludmFsaWQtdHJhbnNpdGlvbi1oYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbnRyYWN0LWZzbS1zZXJ2aWNlL2NvbnRyYWN0LWZzbS1pbnZhbGlkLXRyYW5zaXRpb24taGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxrQ0FBd0M7QUFFeEMsNENBQTRDO0FBQzVDLG1DQUF5RDtBQUV6RCxrSUFBdUg7QUFJdkgsSUFBYSxtQ0FBbUMsR0FBaEQsTUFBYSxtQ0FBbUM7SUFPNUM7Ozs7OztPQU1HO0lBQ0gsS0FBSyxDQUFDLHVCQUF1QixDQUFDLFlBQTBCLEVBQUUsT0FBc0IsRUFBRSxTQUF1QyxFQUFFLE1BQWU7UUFDdEksTUFBTSxLQUFLLEdBQUc7WUFDVixVQUFVLEVBQUUsWUFBWSxDQUFDLFVBQVU7WUFDbkMsYUFBYSxFQUFFLFlBQVksQ0FBQyxlQUFlO1lBQzNDLE9BQU8sRUFBRSxTQUFTLEVBQUUsT0FBTyxJQUFJLEVBQUU7WUFDakMsU0FBUyxFQUFFLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtZQUNoQyxXQUFXLEVBQUUsU0FBUyxFQUFFLFNBQVMsSUFBSSxJQUFJLElBQUksRUFBRTtZQUMvQyxTQUFTLEVBQUUsTUFBTTtTQUNwQixDQUFDO1FBQ0YsTUFBTSxJQUFJLENBQUMsdUNBQXVDLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDO0lBQ2xGLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxDQUFDLE9BQU8sc0JBQWUsQ0FBQyxnQkFBZ0Isb0JBQW9CLENBQUMsQ0FBQyxZQUEwQixFQUFFLE9BQXNCLEVBQUUsU0FBdUM7UUFDM0osTUFBTSxXQUFXLEdBQUcsRUFBQyxtQkFBbUIsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLGlCQUFpQixFQUFFLENBQUMsRUFBQyxDQUFDO1FBQ3BHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7WUFDeEIsS0FBSyxFQUFFLHdDQUF3QyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDekQsUUFBUSxFQUFFLENBQUM7b0JBQ1AsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDO29CQUNsQyxPQUFPLEVBQUUsRUFBQyxTQUFTLEVBQUUsRUFBRSxFQUFDO2lCQUMzQixDQUFDO1NBQ0wsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKLENBQUE7QUF4Q0c7SUFEQyxlQUFNLEVBQUU7OEJBQ0ksb0JBQVc7d0VBQUM7QUFFekI7SUFEQyxlQUFNLEVBQUU7OEJBQ2dDLHFEQUF1QztvR0FBQztBQUx4RSxtQ0FBbUM7SUFGL0MsZ0JBQU8sRUFBRTtJQUNULGNBQUssQ0FBQyxrQkFBUyxDQUFDLFNBQVMsQ0FBQztHQUNkLG1DQUFtQyxDQTJDL0M7QUEzQ1ksa0ZBQW1DIn0=