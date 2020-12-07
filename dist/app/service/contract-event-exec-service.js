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
exports.ContractEventExecService = void 0;
const midway_1 = require("midway");
let ContractEventExecService = class ContractEventExecService {
    constructor() {
        this.eventCodeHandlerMap = new Map();
    }
    /**
     * 详细的事件code与定义参考:https://github.com/freelogfe/freelog_event_definition/blob/master/event_def.csv
     * @param eventInfo
     */
    async contractEventExec(contractInfo, policyInfo, eventInfo) {
        // const contractFsmStateMachine = this.contractFsmGenerator.contractWarpToFsm(contractInfo, policyInfo);
    }
    async _s210EventExec(eventInfo) {
        return null;
    }
    init() {
        this.eventCodeHandlerMap.set('S20', this._s210EventExec);
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractEventExecService.prototype, "ctx", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractEventExecService.prototype, "contractFsmGenerator", void 0);
__decorate([
    midway_1.init(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContractEventExecService.prototype, "init", null);
ContractEventExecService = __decorate([
    midway_1.provide('contractEventExecService')
], ContractEventExecService);
exports.ContractEventExecService = ContractEventExecService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZXZlbnQtZXhlYy1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9zZXJ2aWNlL2NvbnRyYWN0LWV2ZW50LWV4ZWMtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBNkM7QUFJN0MsSUFBYSx3QkFBd0IsR0FBckMsTUFBYSx3QkFBd0I7SUFBckM7UUFPSSx3QkFBbUIsR0FBRyxJQUFJLEdBQUcsRUFBd0QsQ0FBQztJQWtCMUYsQ0FBQztJQWhCRzs7O09BR0c7SUFDSCxLQUFLLENBQUMsaUJBQWlCLENBQUMsWUFBMEIsRUFBRSxVQUFzQixFQUFFLFNBQTBCO1FBQ2xHLHlHQUF5RztJQUM3RyxDQUFDO0lBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxTQUEwQjtRQUMzQyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBR0QsSUFBSTtRQUNBLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUM3RCxDQUFDO0NBQ0osQ0FBQTtBQXRCRztJQURDLGVBQU0sRUFBRTs7cURBQ0w7QUFFSjtJQURDLGVBQU0sRUFBRTs7c0VBQ1k7QUFpQnJCO0lBREMsYUFBSSxFQUFFOzs7O29EQUdOO0FBeEJRLHdCQUF3QjtJQURwQyxnQkFBTyxDQUFDLDBCQUEwQixDQUFDO0dBQ3ZCLHdCQUF3QixDQXlCcEM7QUF6QlksNERBQXdCIn0=