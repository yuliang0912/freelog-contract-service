"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetAuthStatusEventHandler = void 0;
const queue = require("async/queue");
const midway_1 = require("midway");
const enum_1 = require("../../enum");
let SetAuthStatusEventHandler = class SetAuthStatusEventHandler {
    constructor() {
        this.MAX_QUEUE_TASK_COUNT = 50;
    }
    async handle(contractInfos) {
        contractInfos.forEach(contractInfo => {
            if (contractInfo.fsmRunningStatus === enum_1.ContractFsmRunningStatusEnum.Uninitialized || contractInfo.fsmRunningStatus === enum_1.ContractFsmRunningStatusEnum.InitializedError) {
                return;
            }
            if (contractInfo.authStatus !== enum_1.ContractAuthStatusEnum.Unknown) {
                return;
            }
            this.taskQueue.push(contractInfo, this._callback.bind(contractInfo));
        });
    }
    get taskQueue() {
        if (!this._queue) {
            this._queue = queue(this._setAuthStatusEventHandle.bind(this), this.MAX_QUEUE_TASK_COUNT);
        }
        return this._queue;
    }
    async _setAuthStatusEventHandle(contractInfo) {
        throw new Error('授权结果实际取决于标的物服务自身.需要等标的物服务先实现授权API,然后调用授权服务的授权API获取结果');
    }
    async _callback() {
    }
};
SetAuthStatusEventHandler = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('setAuthStatusEventHandler')
], SetAuthStatusEventHandler);
exports.SetAuthStatusEventHandler = SetAuthStatusEventHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0LWF1dGgtc3RhdHVzLWV2ZW50LWhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXZlbnQtaGFuZGxlci9jb250cmFjdC1ldmVudC1oYW5kbGVycy9zZXQtYXV0aC1zdGF0dXMtZXZlbnQtaGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxxQ0FBcUM7QUFDckMsbUNBQXNDO0FBRXRDLHFDQUFnRjtBQUloRixJQUFhLHlCQUF5QixHQUF0QyxNQUFhLHlCQUF5QjtJQUF0QztRQUdhLHlCQUFvQixHQUFHLEVBQUUsQ0FBQztJQTRCdkMsQ0FBQztJQTFCRyxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQTZCO1FBQ3RDLGFBQWEsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDakMsSUFBSSxZQUFZLENBQUMsZ0JBQWdCLEtBQUssbUNBQTRCLENBQUMsYUFBYSxJQUFJLFlBQVksQ0FBQyxnQkFBZ0IsS0FBSyxtQ0FBNEIsQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDakssT0FBTzthQUNWO1lBQ0QsSUFBSSxZQUFZLENBQUMsVUFBVSxLQUFLLDZCQUFzQixDQUFDLE9BQU8sRUFBRTtnQkFDNUQsT0FBTzthQUNWO1lBQ0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDekUsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1QsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDZCxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1NBQzdGO1FBQ0QsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxLQUFLLENBQUMseUJBQXlCLENBQUMsWUFBMEI7UUFDdEQsTUFBTSxJQUFJLEtBQUssQ0FBQyxzREFBc0QsQ0FBQyxDQUFDO0lBQzVFLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUztJQUVmLENBQUM7Q0FDSixDQUFBO0FBL0JZLHlCQUF5QjtJQUZyQyxjQUFLLENBQUMsV0FBVyxDQUFDO0lBQ2xCLGdCQUFPLENBQUMsMkJBQTJCLENBQUM7R0FDeEIseUJBQXlCLENBK0JyQztBQS9CWSw4REFBeUIifQ==