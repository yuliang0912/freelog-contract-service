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
exports.ContractFsmEventHandler = void 0;
const egg_freelog_base_1 = require("egg-freelog-base");
const midway_1 = require("midway");
const enum_1 = require("../../enum");
let ContractFsmEventHandler = class ContractFsmEventHandler {
    constructor() {
        this.contractEventHandlerMap = new Map();
    }
    async handle(eventEnum, ...args) {
        if (!this.contractEventHandlerMap.has(eventEnum)) {
            throw new egg_freelog_base_1.ApplicationError(`${eventEnum} even handler is not implement`);
        }
        return this.contractEventHandlerMap.get(eventEnum).handle(...args);
    }
    initialEventHandler() {
        this.contractEventHandlerMap.set(enum_1.ContractFsmEventEnum.FsmStateTransition, this.contractFsmStateTransitionHandler);
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractFsmEventHandler.prototype, "contractFsmStateTransitionHandler", void 0);
__decorate([
    midway_1.init(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContractFsmEventHandler.prototype, "initialEventHandler", null);
ContractFsmEventHandler = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('contractFsmEventHandler')
], ContractFsmEventHandler);
exports.ContractFsmEventHandler = ContractFsmEventHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXZlbnQtaGFuZGxlci9jb250cmFjdC1mc20tZXZlbnQtaGFuZGxlcnMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsdURBQWtEO0FBQ2xELG1DQUFvRDtBQUNwRCxxQ0FBZ0Q7QUFLaEQsSUFBYSx1QkFBdUIsR0FBcEMsTUFBYSx1QkFBdUI7SUFBcEM7UUFLYSw0QkFBdUIsR0FBNkMsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQWEzRixDQUFDO0lBWEcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUErQixFQUFFLEdBQUcsSUFBSTtRQUNqRCxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUM5QyxNQUFNLElBQUksbUNBQWdCLENBQUMsR0FBRyxTQUFTLGdDQUFnQyxDQUFDLENBQUM7U0FDNUU7UUFDRCxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUdELG1CQUFtQjtRQUNmLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsMkJBQW9CLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7SUFDdEgsQ0FBQztDQUNKLENBQUE7QUFmRztJQURDLGVBQU0sRUFBRTs7a0ZBQ3dDO0FBWWpEO0lBREMsYUFBSSxFQUFFOzs7O2tFQUdOO0FBakJRLHVCQUF1QjtJQUZuQyxjQUFLLENBQUMsV0FBVyxDQUFDO0lBQ2xCLGdCQUFPLENBQUMseUJBQXlCLENBQUM7R0FDdEIsdUJBQXVCLENBa0JuQztBQWxCWSwwREFBdUIifQ==