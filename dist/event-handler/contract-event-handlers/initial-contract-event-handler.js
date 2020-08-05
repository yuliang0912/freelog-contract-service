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
exports.InitialContractEventHandler = void 0;
const queue = require("async/queue");
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
const enum_1 = require("../../enum");
let InitialContractEventHandler = class InitialContractEventHandler {
    constructor() {
        this.MAX_QUEUE_TASK_COUNT = 50;
    }
    get taskQueue() {
        if (!this._queue) {
            this._queue = queue(this._initialContract.bind(this), this.MAX_QUEUE_TASK_COUNT);
        }
        return this._queue;
    }
    /**
     * TODO: 1.对合同实例化时的参数进行解析并且赋值,保存到contractInfo.fsmDeclarations中
     * TODO: 2.分析出状态机中描述信息中的初始态名称,并且赋值.
     * TODO: 3.把合同转换成状态机.然后后续的事件处理,由统一的状态机事件系统介入.
     * TODO: 后续服务需要提供定时JOB,用于扫描状态为Uninitialized或InitializedError的合约.然后对其初始化,防止部分合约初始化失败.
     */
    async handle(contractInfos) {
        const contractPolicyMap = await this.policyService.findByIds(contractInfos.map(x => x.policyId))
            .then(list => new Map(list.map(x => [x.policyId, x])));
        contractInfos.forEach(contractInfo => {
            if (!contractInfo.contractId || ![enum_1.ContractFsmRunningStatusEnum.Uninitialized, enum_1.ContractFsmRunningStatusEnum.InitializedError].includes(contractInfo.fsmRunningStatus)) {
                return;
            }
            const callback = this._callback.bind({ contractInfo, contractService: this.contractService });
            if (!contractPolicyMap.has(contractInfo.policyId)) {
                callback(new Error(`policy [id:${contractInfo.policyId}] is not found`));
                return;
            }
            this.taskQueue.push({
                contractInfo,
                policyInfo: contractPolicyMap.get(contractInfo.policyId)
            }, callback);
        });
    }
    async _initialContract(contract) {
        const { contractInfo, policyInfo } = contract;
        if (contractInfo.authStatus !== enum_1.ContractAuthStatusEnum.Unknown) {
            throw new egg_freelog_base_1.ApplicationError('please check contract data. contract.authStatus is invalid');
        }
        // 目前初始态的状态名固定为init或initial (后续规则也可能修改为第一个)
        contractInfo.fsmCurrentState = Object.keys(policyInfo.fsmDescriptionInfo).find(x => /^(init|initial)$/i.test(x));
        this.contractFsmGenerator.contractWarpToFsm(contractInfo, policyInfo);
    }
    /**
     * 初始化错误处理
     * @param error
     * @returns {Promise<void>}
     * @private
     */
    _callback(error) {
        if (!error) {
            return;
        }
        const contractInfo = this.contractInfo;
        this.contractService.updateContractInfo(contractInfo, { fsmRunningStatus: enum_1.ContractFsmRunningStatusEnum.InitializedError }).finally(err => {
            console.log(`===============begin:${contractInfo.contractId}=======================`);
            console.log(`contract initial error`, error.toString());
            if (err) {
                console.log(err);
            }
            console.log(`===============end:${contractInfo.contractId}=======================`);
        });
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], InitialContractEventHandler.prototype, "contractFsmGenerator", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], InitialContractEventHandler.prototype, "policyService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], InitialContractEventHandler.prototype, "contractService", void 0);
InitialContractEventHandler = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('initialContractEventHandler')
], InitialContractEventHandler);
exports.InitialContractEventHandler = InitialContractEventHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdGlhbC1jb250cmFjdC1ldmVudC1oYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2V2ZW50LWhhbmRsZXIvY29udHJhY3QtZXZlbnQtaGFuZGxlcnMvaW5pdGlhbC1jb250cmFjdC1ldmVudC1oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFxQztBQUNyQyxtQ0FBOEM7QUFDOUMsdURBQWtEO0FBRWxELHFDQUFnRjtBQUloRixJQUFhLDJCQUEyQixHQUF4QyxNQUFhLDJCQUEyQjtJQUF4QztRQUdhLHlCQUFvQixHQUFHLEVBQUUsQ0FBQztJQXNFdkMsQ0FBQztJQTlERyxJQUFJLFNBQVM7UUFDVCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNkLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7U0FDcEY7UUFDRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLE1BQU0sQ0FBQyxhQUE2QjtRQUN0QyxNQUFNLGlCQUFpQixHQUE0QixNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDcEgsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzRCxhQUFhLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQ2pDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxtQ0FBNEIsQ0FBQyxhQUFhLEVBQUUsbUNBQTRCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLEVBQUU7Z0JBQ2xLLE9BQU87YUFDVjtZQUNELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUMsWUFBWSxFQUFFLGVBQWUsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFDLENBQUMsQ0FBQztZQUM1RixJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDL0MsUUFBUSxDQUFDLElBQUksS0FBSyxDQUFDLGNBQWMsWUFBWSxDQUFDLFFBQVEsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO2dCQUN6RSxPQUFPO2FBQ1Y7WUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztnQkFDaEIsWUFBWTtnQkFDWixVQUFVLEVBQUUsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUM7YUFDM0QsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNqQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsUUFBZ0U7UUFDbkYsTUFBTSxFQUFDLFlBQVksRUFBRSxVQUFVLEVBQUMsR0FBRyxRQUFRLENBQUM7UUFDNUMsSUFBSSxZQUFZLENBQUMsVUFBVSxLQUFLLDZCQUFzQixDQUFDLE9BQU8sRUFBRTtZQUM1RCxNQUFNLElBQUksbUNBQWdCLENBQUMsNERBQTRELENBQUMsQ0FBQztTQUM1RjtRQUNELDJDQUEyQztRQUMzQyxZQUFZLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakgsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGlCQUFpQixDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztJQUMxRSxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxTQUFTLENBQVksS0FBSztRQUN0QixJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1IsT0FBTztTQUNWO1FBQ0QsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQTRCLENBQUM7UUFDdkQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsRUFBQyxnQkFBZ0IsRUFBRSxtQ0FBNEIsQ0FBQyxnQkFBZ0IsRUFBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ25JLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLFlBQVksQ0FBQyxVQUFVLHlCQUF5QixDQUFDLENBQUM7WUFDdEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUN4RCxJQUFJLEdBQUcsRUFBRTtnQkFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3BCO1lBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsWUFBWSxDQUFDLFVBQVUseUJBQXlCLENBQUMsQ0FBQztRQUN4RixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSixDQUFBO0FBcEVHO0lBREMsZUFBTSxFQUFFOzt5RUFDWTtBQUVyQjtJQURDLGVBQU0sRUFBRTs7a0VBQ3FCO0FBRTlCO0lBREMsZUFBTSxFQUFFOztvRUFDeUI7QUFUekIsMkJBQTJCO0lBRnZDLGNBQUssQ0FBQyxXQUFXLENBQUM7SUFDbEIsZ0JBQU8sQ0FBQyw2QkFBNkIsQ0FBQztHQUMxQiwyQkFBMkIsQ0F5RXZDO0FBekVZLGtFQUEyQiJ9