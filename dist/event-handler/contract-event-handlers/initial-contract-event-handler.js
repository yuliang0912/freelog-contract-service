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
                callback(new Error(`policy [id:${contractInfo.policyId}] is invalid`));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdGlhbC1jb250cmFjdC1ldmVudC1oYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2V2ZW50LWhhbmRsZXIvY29udHJhY3QtZXZlbnQtaGFuZGxlcnMvaW5pdGlhbC1jb250cmFjdC1ldmVudC1oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFxQztBQUNyQyxtQ0FBOEM7QUFFOUMscUNBQXdEO0FBSXhELElBQWEsMkJBQTJCLEdBQXhDLE1BQWEsMkJBQTJCO0lBQXhDO1FBR2EseUJBQW9CLEdBQUcsRUFBRSxDQUFDO0lBbUV2QyxDQUFDO0lBM0RHLElBQUksU0FBUztRQUNULElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2QsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztTQUNwRjtRQUNELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQTZCO1FBQ3RDLE1BQU0saUJBQWlCLEdBQTRCLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNwSCxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNELGFBQWEsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDakMsSUFBSSxD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