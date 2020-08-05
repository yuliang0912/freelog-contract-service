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
exports.OutsideServiceEventHandler = void 0;
const egg_freelog_base_1 = require("egg-freelog-base");
const midway_1 = require("midway");
let OutsideServiceEventHandler = class OutsideServiceEventHandler {
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
        // this.contractEventHandlerMap.set(OutsideServiceEventEnum.RegisterCompletedEvent, this.contractFsmStateTransitionHandler);
    }
};
__decorate([
    midway_1.init(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OutsideServiceEventHandler.prototype, "initialEventHandler", null);
OutsideServiceEventHandler = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('outsideServiceEventHandler')
], OutsideServiceEventHandler);
exports.OutsideServiceEventHandler = OutsideServiceEventHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXZlbnQtaGFuZGxlci9vdXRzaWRlLXNlcnZpY2UtZXZlbnQtaGFuZGxlcnMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQ0EsdURBQWtEO0FBQ2xELG1DQUE0QztBQUs1QyxJQUFhLDBCQUEwQixHQUF2QyxNQUFhLDBCQUEwQjtJQUF2QztRQUVhLDRCQUF1QixHQUFnRCxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBYTlGLENBQUM7SUFYRyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQWtDLEVBQUUsR0FBRyxJQUFJO1FBQ3BELElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzlDLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxHQUFHLFNBQVMsZ0NBQWdDLENBQUMsQ0FBQztTQUM1RTtRQUNELE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBR0QsbUJBQW1CO1FBQ2YsNEhBQTRIO0lBQ2hJLENBQUM7Q0FDSixDQUFBO0FBSEc7SUFEQyxhQUFJLEVBQUU7Ozs7cUVBR047QUFkUSwwQkFBMEI7SUFGdEMsY0FBSyxDQUFDLFdBQVcsQ0FBQztJQUNsQixnQkFBTyxDQUFDLDRCQUE0QixDQUFDO0dBQ3pCLDBCQUEwQixDQWV0QztBQWZZLGdFQUEwQiJ9