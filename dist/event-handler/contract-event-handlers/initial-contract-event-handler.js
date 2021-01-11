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
const lodash_1 = require("lodash");
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
        for (const contractInfo of contractInfos) {
            if (!contractInfo.contractId || ![enum_1.ContractFsmRunningStatusEnum.Uninitialized, enum_1.ContractFsmRunningStatusEnum.InitializedError].includes(contractInfo.fsmRunningStatus)) {
                continue;
            }
            const callback = this._callback.bind({ contractInfo, contractService: this.contractService });
            if (!contractPolicyMap.has(contractInfo.policyId)) {
                callback(new Error(`policy [id:${contractInfo.policyId}] is invalid`));
                continue;
            }
            this.taskQueue.push({
                contractInfo, policyInfo: contractPolicyMap.get(contractInfo.policyId)
            }, callback);
        }
    }
    async _initialContract(contract) {
        const { contractInfo, policyInfo } = contract;
        // 目前初始态的状态名固定为init或initial (后续规则也可能修改为第一个)
        contractInfo.fsmCurrentState = Object.keys(policyInfo.fsmDescriptionInfo).find(x => policyInfo.fsmDescriptionInfo[x].isInitial);
        if (!lodash_1.isString(contractInfo.fsmCurrentState)) {
            // 兼容模式:默认使用第一个状态作为初始态
            contractInfo.fsmCurrentState = lodash_1.first(Object.keys(policyInfo.fsmDescriptionInfo));
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdGlhbC1jb250cmFjdC1ldmVudC1oYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2V2ZW50LWhhbmRsZXIvY29udHJhY3QtZXZlbnQtaGFuZGxlcnMvaW5pdGlhbC1jb250cmFjdC1ldmVudC1oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFxQztBQUNyQyxtQ0FBOEM7QUFFOUMscUNBQXdEO0FBQ3hELG1DQUF1QztBQUl2QyxJQUFhLDJCQUEyQixHQUF4QyxNQUFhLDJCQUEyQjtJQUF4QztRQUdhLHlCQUFvQixHQUFHLEVBQUUsQ0FBQztJQXdFdkMsQ0FBQztJQWhFRyxJQUFJLFNBQVM7UUFDVCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNkLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7U0FDcEY7UUFDRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLE1BQU0sQ0FBQyxhQUE2QjtRQUV0QyxNQUFNLGlCQUFpQixHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUMzRixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTNELEtBQUssTUFBTSxZQUFZLElBQUksYUFBYSxFQUFFO1lBQ3RD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