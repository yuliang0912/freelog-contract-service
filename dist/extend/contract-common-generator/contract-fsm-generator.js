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
     * @param contractInfo
     * @param contractPolicyInfo
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
     * @param contractInfo
     * @param contractPolicyInfo
     * @param eventId
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZnNtLWdlbmVyYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9leHRlbmQvY29udHJhY3QtY29tbW9uLWdlbmVyYXRvci9jb250cmFjdC1mc20tZ2VuZXJhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUF1QztBQUN2Qyx1REFBK0M7QUFDL0MscUNBQThFO0FBSTlFLElBQWEsb0JBQW9CLEdBQWpDLE1BQWEsb0JBQW9CO0lBTzdCOzs7O09BSUc7SUFDSCxpQkFBaUIsQ0FBQyxZQUEwQixFQUFFLGtCQUE4QjtRQUN4RSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDckIsTUFBTSxJQUFJLGdDQUFhLENBQUMsa0RBQWtELENBQUMsQ0FBQztTQUMvRTtRQUNELElBQUk7WUFDQSxPQUFPLElBQUksQ0FBQywyQkFBMkI7aUJBQ2xDLHFCQUFxQixDQUFDLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDO2lCQUM1RCxhQUFhLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQztpQkFDN0IsMEJBQTBCLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLENBQUM7aUJBQ2hHLGVBQWUsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDO2lCQUM3QyxLQUFLLEVBQUUsQ0FBQztTQUNoQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNmLFdBQVc7U0FDZDtJQUNMLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILGNBQWMsQ0FBQyxZQUEwQixFQUFFLGtCQUE4QixFQUFFLE9BQWU7UUFDdEYsSUFBSSxZQUFZLENBQUMsZ0JBQWdCLEtBQUssbUNBQTRCLENBQUMsTUFBTSxFQUFFO1lBQ3ZFLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBQ0QsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxFQUFFLGtCQUFrQixDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2pGLENBQUM7SUFFRCxtQkFBbUI7SUFFbkIsd0JBQXdCLENBQUMsa0JBQTBCO1FBQy9DLE9BQU8sQ0FBQyxTQUFTLEVBQUUsR0FBRyxJQUFJLEVBQUUsRUFBRTtZQUMxQixNQUFNLEVBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUMsR0FBRyxTQUFTLENBQUM7WUFDbEMsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLE9BQW1CLENBQUM7WUFDeEMsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLFlBQTRCLENBQUM7WUFDdEQsOERBQThEO1lBQzlELElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLG1DQUE0QixDQUFDLGFBQWEsRUFBRSxtQ0FBNEIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtnQkFDOUosT0FBTzthQUNWO1lBQ0QseUJBQXlCO1lBQ3pCLE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sQ0FBQywyQkFBb0IsQ0FBQyxrQkFBa0IsRUFBRSxZQUFZLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDNUosQ0FBQyxDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUE7QUF0REc7SUFEQyxlQUFNLEVBQUU7O3lFQUNtQjtBQUU1QjtJQURDLGVBQU0sRUFBRTs7cUVBQ3lDO0FBTHpDLG9CQUFvQjtJQURoQyxnQkFBTyxDQUFDLHNCQUFzQixDQUFDO0dBQ25CLG9CQUFvQixDQXlEaEM7QUF6RFksb0RBQW9CIn0=