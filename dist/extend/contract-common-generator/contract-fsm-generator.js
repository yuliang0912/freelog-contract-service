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
exports.ContractFsmGenerator = void 0;
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
const enum_1 = require("../../enum");
let ContractFsmGenerator = class ContractFsmGenerator {
    /**
     * 合同转换为可执行的状态机
     * @param {ContractInfo} contractInfo
     * @param {ContractPolicyInfo} contractPolicyInfo
     * @returns {any}
     */
    contractWarpToFsm(contractInfo, contractPolicyInfo) {
        if (!contractPolicyInfo) {
            throw new egg_freelog_base_1.ArgumentError('param contractInfo.contractPolicyInfo is invalid');
        }
        try {
            return this.contractStateMachineBuilder
                .setFsmDescriptionInfo(contractPolicyInfo.fsmDescriptionInfo)
                .setAttachData({ contractInfo })
                .setOnEnterStateEventHandle(this._onEnterStateEventHandle(contractPolicyInfo.fsmDescriptionInfo))
                .setInitialState(contractInfo.fsmCurrentState)
                .build();
        }
        catch (e) {
            console.log(e);
            // throw e;
        }
    }
    /**
     * 是否可以执行指定的事件
     * @param {ContractInfo} contractInfo
     * @param {ContractPolicyInfo} contractPolicyInfo
     * @param {string} eventId
     * @returns {boolean}
     */
    isCanExecEvent(contractInfo, contractPolicyInfo, eventId) {
        if (contractInfo.fsmRunningStatus === enum_1.ContractFsmRunningStatusEnum.Locked) {
            return false;
        }
        return this.contractWarpToFsm(contractInfo, contractPolicyInfo).can(eventId);
    }
    // isCanExecEvent()
    _onEnterStateEventHandle(fsmDescriptionInfo) {
        return (lifeCycle, ...args) => {
            const { fsm, from, to } = lifeCycle;
            const history = fsm.history;
            const contractInfo = fsm.contractInfo;
            // 状态机默认初始化时,会触发一次从none到initialState的状态改变事件.此事件一般无意义,无需对事件作出回应
            if (history.length === 1 && ![enum_1.ContractFsmRunningStatusEnum.Uninitialized, enum_1.ContractFsmRunningStatusEnum.InitializedError].includes(contractInfo.fsmRunningStatus)) {
                return;
            }
            // fsm.fsmDescriptionInfo
            return this.contractFsmEventHandler.handle(enum_1.ContractFsmEventEnum.FsmStateTransition, contractInfo, fsmDescriptionInfo, from, to, fsm.currEvent, ...args);
        };
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractFsmGenerator.prototype, "contractStateMachineBuilder", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractFsmGenerator.prototype, "contractFsmEventHandler", void 0);
ContractFsmGenerator = __decorate([
    midway_1.provide('contractFsmGenerator')
], ContractFsmGenerator);
exports.ContractFsmGenerator = ContractFsmGenerator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZnNtLWdlbmVyYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9leHRlbmQvY29udHJhY3QtY29tbW9uLWdlbmVyYXRvci9jb250cmFjdC1mc20tZ2VuZXJhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUF1QztBQUN2Qyx1REFBK0M7QUFDL0MscUNBQThFO0FBSTlFLElBQWEsb0JBQW9CLEdBQWpDLE1BQWEsb0JBQW9CO0lBTzdCOzs7OztPQUtHO0lBQ0gsaUJBQWlCLENBQUMsWUFBMEIsRUFBRSxrQkFBOEI7UUFDeEUsSUFBSSxDQUFDLGtCQUFrQixFQUFFO1lBQ3JCLE1BQU0sSUFBSSxnQ0FBYSxDQUFDLGtEQUFrRCxDQUFDLENBQUM7U0FDL0U7UUFDRCxJQUFJO1lBQ0EsT0FBTyxJQUFJLENBQUMsMkJBQTJCO2lCQUNsQyxxQkFBcUIsQ0FBQyxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQztpQkFDNUQsYUFBYSxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUM7aUJBQzdCLDBCQUEwQixDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2lCQUNoRyxlQUFlLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQztpQkFDN0MsS0FBSyxFQUFFLENBQUM7U0FDaEI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDZixXQUFXO1NBQ2Q7SUFDTCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsY0FBYyxDQUFDLFlBQTBCLEVBQUUsa0JBQThCLEVBQUUsT0FBZTtRQUN0RixJQUFJLFlBQVksQ0FBQyxnQkFBZ0IsS0FBSyxtQ0FBNEIsQ0FBQyxNQUFNLEVBQUU7WUFDdkUsT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFDRCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDakYsQ0FBQztJQUVELG1CQUFtQjtJQUVuQix3QkFBd0IsQ0FBQyxrQkFBMEI7UUFDL0MsT0FBTyxDQUFDLFNBQVMsRUFBRSxHQUFHLElBQUksRUFBRSxFQUFFO1lBQzFCLE1BQU0sRUFBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBQyxHQUFHLFNBQVMsQ0FBQztZQUNsQyxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsT0FBbUIsQ0FBQztZQUN4QyxNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsWUFBNEIsQ0FBQztZQUN0RCw4REFBOEQ7WUFDOUQsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsbUNBQTRCLENBQUMsYUFBYSxFQUFFLG1DQUE0QixDQUFDLGdCQUFnQixDQUFDLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO2dCQUM5SixPQUFPO2FBQ1Y7WUFDRCx5QkFBeUI7WUFDekIsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDLDJCQUFvQixDQUFDLGtCQUFrQixFQUFFLFlBQVksRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUM1SixDQUFDLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQTtBQXhERztJQURDLGVBQU0sRUFBRTs7eUVBQ21CO0FBRTVCO0lBREMsZUFBTSxFQUFFOztxRUFDeUM7QUFMekMsb0JBQW9CO0lBRGhDLGdCQUFPLENBQUMsc0JBQXNCLENBQUM7R0FDbkIsb0JBQW9CLENBMkRoQztBQTNEWSxvREFBb0IifQ==