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
            throw e;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZnNtLWdlbmVyYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9leHRlbmQvY29udHJhY3QtY29tbW9uLWdlbmVyYXRvci9jb250cmFjdC1mc20tZ2VuZXJhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUF1QztBQUN2Qyx1REFBK0M7QUFDL0MscUNBQThFO0FBSTlFLElBQWEsb0JBQW9CLEdBQWpDLE1BQWEsb0JBQW9CO0lBTzdCOzs7OztPQUtHO0lBQ0gsaUJBQWlCLENBQUMsWUFBMEIsRUFBRSxrQkFBOEI7UUFDeEUsSUFBSSxDQUFDLGtCQUFrQixFQUFFO1lBQ3JCLE1BQU0sSUFBSSxnQ0FBYSxDQUFDLGtEQUFrRCxDQUFDLENBQUM7U0FDL0U7UUFDRCxJQUFJO1lBQ0EsT0FBTyxJQUFJLENBQUMsMkJBQTJCO2lCQUNsQyxxQkFBcUIsQ0FBQyxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQztpQkFDNUQsYUFBYSxDQUFDLEVBQUMsWUFBWSxFQUFDLENBQUM7aUJBQzdCLDBCQUEwQixDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2lCQUNoRyxlQUFlLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQztpQkFDN0MsS0FBSyxFQUFFLENBQUM7U0FDaEI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE1BQU0sQ0FBQyxDQUFDO1NBQ1g7SUFDTCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsY0FBYyxDQUFDLFlBQTBCLEVBQUUsa0JBQThCLEVBQUUsT0FBZTtRQUN0RixJQUFJLFlBQVksQ0FBQyxnQkFBZ0IsS0FBSyxtQ0FBNEIsQ0FBQyxNQUFNLEVBQUU7WUFDdkUsT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFDRCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDakYsQ0FBQztJQUVELHdCQUF3QixDQUFDLGtCQUEwQjtRQUMvQyxPQUFPLENBQUMsU0FBUyxFQUFFLEdBQUcsSUFBSSxFQUFFLEVBQUU7WUFDMUIsTUFBTSxFQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFDLEdBQUcsU0FBUyxDQUFDO1lBQ2xDLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxPQUFtQixDQUFDO1lBQ3hDLE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxZQUE0QixDQUFDO1lBQ3RELDhEQUE4RDtZQUM5RCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxtQ0FBNEIsQ0FBQyxhQUFhLEVBQUUsbUNBQTRCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLEVBQUU7Z0JBQzlKLE9BQU87YUFDVjtZQUNELHlCQUF5QjtZQUN6QixPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsMkJBQW9CLENBQUMsa0JBQWtCLEVBQUUsWUFBWSxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQzVKLENBQUMsQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFBO0FBckRHO0lBREMsZUFBTSxFQUFFOzt5RUFDbUI7QUFFNUI7SUFEQyxlQUFNLEVBQUU7O3FFQUN5QztBQUx6QyxvQkFBb0I7SUFEaEMsZ0JBQU8sQ0FBQyxzQkFBc0IsQ0FBQztHQUNuQixvQkFBb0IsQ0F3RGhDO0FBeERZLG9EQUFvQiJ9