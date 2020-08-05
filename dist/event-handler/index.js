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
const midway_1 = require("midway");
let ContractEventHandler = class ContractEventHandler {
    /**
     * 触发合同事件
     * @param {ContractEventEnum} eventEnum
     * @param args
     * @returns {Promise<any>}
     */
    async contractEventHandle(eventEnum, ...args) {
        return this.contractEventHandler.handle(eventEnum, ...args);
    }
    /**
     * 触发合同状态机事件
     * @param {ContractFsmEventEnum} eventEnum
     * @param args
     * @returns {Promise<any>}
     */
    async contractFsmEventHandle(eventEnum, ...args) {
        return this.contractFsmEventHandler.handle(eventEnum, ...args);
    }
    /**
     * 触发接收到外部服务事件
     * @param {OutsideServiceEventEnum} eventEnum
     * @param args
     * @returns {Promise<any>}
     */
    async outsideServiceEventHandle(eventEnum, ...args) {
        return this.outsideServiceEventHandler.handle(eventEnum, ...args);
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractEventHandler.prototype, "contractEventHandler", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractEventHandler.prototype, "contractFsmEventHandler", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractEventHandler.prototype, "outsideServiceEventHandler", void 0);
ContractEventHandler = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('commonEventHandler')
], ContractEventHandler);
exports.ContractEventHandler = ContractEventHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXZlbnQtaGFuZGxlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBOEM7QUFROUMsSUFBYSxvQkFBb0IsR0FBakMsTUFBYSxvQkFBb0I7SUFTN0I7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMsbUJBQW1CLENBQUMsU0FBNEIsRUFBRSxHQUFHLElBQUk7UUFDM0QsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxTQUErQixFQUFFLEdBQUcsSUFBSTtRQUNqRSxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLHlCQUF5QixDQUFDLFNBQWtDLEVBQUUsR0FBRyxJQUFJO1FBQ3ZFLE9BQU8sSUFBSSxDQUFDLDBCQUEwQixDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUN0RSxDQUFDO0NBQ0osQ0FBQTtBQW5DRztJQURDLGVBQU0sRUFBRTs7a0VBQ21DO0FBRTVDO0lBREMsZUFBTSxFQUFFOztxRUFDeUM7QUFFbEQ7SUFEQyxlQUFNLEVBQUU7O3dFQUMrQztBQVAvQyxvQkFBb0I7SUFGaEMsY0FBSyxDQUFDLFdBQVcsQ0FBQztJQUNsQixnQkFBTyxDQUFDLG9CQUFvQixDQUFDO0dBQ2pCLG9CQUFvQixDQXNDaEM7QUF0Q1ksb0RBQW9CIn0=