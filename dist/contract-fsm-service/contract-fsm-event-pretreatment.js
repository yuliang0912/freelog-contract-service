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
exports.ContractFsmEventPretreatment = void 0;
const enum_1 = require("../enum");
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
const contract_invalid_transition_record_provider_1 = require("../app/data-provider/contract-invalid-transition-record-provider");
let ContractFsmEventPretreatment = class ContractFsmEventPretreatment {
    /**
     * 交易事件预处理
     * @param contractInfo
     * @param session
     * @param eventInfo
     */
    async [`onBefore${enum_1.PolicyEventEnum.TransactionEvent}Handle`](contractInfo, session, eventInfo) {
        const ctx = this.app.createAnonymousContext();
        const transactionRecordInfo = await ctx.curlIntranetApi(`${ctx.webApi.transactionInfoV2}/records/${eventInfo.args.transactionRecordId}`);
        // 合约在拨动状态之前.会对交易状态做二次确认.只有待确认状态的交易才是有效的.主要防止交易确认超时,导致支付中心把交易取消了.但是合约服务依然拨动了合约状态
        if (transactionRecordInfo.status !== 1) {
            const model = {
                contractId: contractInfo.contractId,
                contractState: contractInfo.fsmCurrentState,
                eventId: eventInfo?.eventId ?? '',
                eventCode: eventInfo?.code ?? '',
                eventInfo,
                triggerDate: eventInfo?.eventTime ?? new Date(),
                remark: '交易记录状态校验失败,交易已经被处理.'
            };
            await this.contractInvalidTransitionRecordProvider.create([model], { session });
            throw new egg_freelog_base_1.BreakOffError('交易已被处理.不能重复');
        }
    }
};
__decorate([
    midway_1.plugin(),
    __metadata("design:type", Object)
], ContractFsmEventPretreatment.prototype, "app", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", contract_invalid_transition_record_provider_1.default)
], ContractFsmEventPretreatment.prototype, "contractInvalidTransitionRecordProvider", void 0);
ContractFsmEventPretreatment = __decorate([
    midway_1.provide(),
    midway_1.scope(midway_1.ScopeEnum.Singleton)
], ContractFsmEventPretreatment);
exports.ContractFsmEventPretreatment = ContractFsmEventPretreatment;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZnNtLWV2ZW50LXByZXRyZWF0bWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cmFjdC1mc20tc2VydmljZS9jb250cmFjdC1mc20tZXZlbnQtcHJldHJlYXRtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLGtDQUF3QztBQUV4QyxtQ0FBaUU7QUFFakUsdURBQW1GO0FBQ25GLGtJQUF1SDtBQUl2SCxJQUFhLDRCQUE0QixHQUF6QyxNQUFhLDRCQUE0QjtJQU9yQzs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxDQUFDLFdBQVcsc0JBQWUsQ0FBQyxnQkFBZ0IsUUFBUSxDQUFDLENBQUMsWUFBMEIsRUFBRSxPQUFzQixFQUFFLFNBQXVDO1FBRW5KLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsc0JBQXNCLEVBQW9CLENBQUM7UUFDaEUsTUFBTSxxQkFBcUIsR0FBRyxNQUFNLEdBQUcsQ0FBQyxlQUFlLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLGlCQUFpQixZQUFZLFNBQVMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO1FBQ3pJLGdGQUFnRjtRQUNoRixJQUFJLHFCQUFxQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDcEMsTUFBTSxLQUFLLEdBQUc7Z0JBQ1YsVUFBVSxFQUFFLFlBQVksQ0FBQyxVQUFVO2dCQUNuQyxhQUFhLEVBQUUsWUFBWSxDQUFDLGVBQWU7Z0JBQzNDLE9BQU8sRUFBRSxTQUFTLEVBQUUsT0FBTyxJQUFJLEVBQUU7Z0JBQ2pDLFNBQVMsRUFBRSxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUU7Z0JBQ2hDLFNBQVM7Z0JBQ1QsV0FBVyxFQUFFLFNBQVMsRUFBRSxTQUFTLElBQUksSUFBSSxJQUFJLEVBQUU7Z0JBQy9DLE1BQU0sRUFBRSxxQkFBcUI7YUFDaEMsQ0FBQztZQUNGLE1BQU0sSUFBSSxDQUFDLHVDQUF1QyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQztZQUM5RSxNQUFNLElBQUksZ0NBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztTQUMxQztJQUNMLENBQUM7Q0FDSixDQUFBO0FBN0JHO0lBREMsZUFBTSxFQUFFOzt5REFDZTtBQUV4QjtJQURDLGVBQU0sRUFBRTs4QkFDZ0MscURBQXVDOzZGQUFDO0FBTHhFLDRCQUE0QjtJQUZ4QyxnQkFBTyxFQUFFO0lBQ1QsY0FBSyxDQUFDLGtCQUFTLENBQUMsU0FBUyxDQUFDO0dBQ2QsNEJBQTRCLENBZ0N4QztBQWhDWSxvRUFBNEIifQ==