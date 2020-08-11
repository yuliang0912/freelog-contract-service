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
exports.ContractEventHandler = void 0;
const egg_freelog_base_1 = require("egg-freelog-base");
const midway_1 = require("midway");
const enum_1 = require("../../enum");
let ContractEventHandler = class ContractEventHandler {
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
        this.contractEventHandlerMap.set(enum_1.ContractEventEnum.InitialContractFsmEvent, this.initialContractEventHandler);
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractEventHandler.prototype, "initialContractEventHandler", void 0);
__decorate([
    midway_1.init(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContractEventHandler.prototype, "initialEventHandler", null);
ContractEventHandler = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('contractEventHandler')
], ContractEventHandler);
exports.ContractEventHandler = ContractEventHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXZlbnQtaGFuZGxlci9jb250cmFjdC1ldmVudC1oYW5kbGVycy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFDQSx1REFBa0Q7QUFDbEQsbUNBQW9EO0FBQ3BELHFDQUE2QztBQUk3QyxJQUFhLG9CQUFvQixHQUFqQyxNQUFhLG9CQUFvQjtJQUFqQztRQUthLDRCQUF1QixHQUEwQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBYXhGLENBQUM7SUFYRyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQTRCLEVBQUUsR0FBRyxJQUFJO1FBQzlDLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzlDLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxHQUFHLFNBQVMsZ0NBQWdDLENBQUMsQ0FBQztTQUM1RTtRQUNELE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBR0QsbUJBQW1CO1FBQ2YsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyx3QkFBaUIsQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQztJQUNsSCxDQUFDO0NBQ0osQ0FBQTtBQWZHO0lBREMsZUFBTSxFQUFFOzt5RUFDa0M7QUFZM0M7SUFEQyxhQUFJLEVBQUU7Ozs7K0RBR047QUFqQlEsb0JBQW9CO0lBRmhDLGNBQUssQ0FBQyxXQUFXLENBQUM7SUFDbEIsZ0JBQU8sQ0FBQyxzQkFBc0IsQ0FBQztHQUNuQixvQkFBb0IsQ0FrQmhDO0FBbEJZLG9EQUFvQiJ9