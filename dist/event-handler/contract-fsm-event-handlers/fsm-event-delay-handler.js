"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractFsmEventDelayHandler = void 0;
const midway_1 = require("midway");
let ContractFsmEventDelayHandler = class ContractFsmEventDelayHandler {
    /**
     * TODO: 当同一个合同的多个事件并发执行时,会遇到合同锁定的情况,导致无法并行执行.此时需要把后续的消息延后处理
     * TODO: 实现方案是给rabbitMQ加一个死信队列.通过设置过期事件.重新路由一个延迟事件消息的队列来处理此类事件
     * @returns {Promise<void>}
     */
    async handle() {
    }
};
ContractFsmEventDelayHandler = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('contractFsmEventDelayHandler')
], ContractFsmEventDelayHandler);
exports.ContractFsmEventDelayHandler = ContractFsmEventDelayHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnNtLWV2ZW50LWRlbGF5LWhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXZlbnQtaGFuZGxlci9jb250cmFjdC1mc20tZXZlbnQtaGFuZGxlcnMvZnNtLWV2ZW50LWRlbGF5LWhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsbUNBQXNDO0FBS3RDLElBQWEsNEJBQTRCLEdBQXpDLE1BQWEsNEJBQTRCO0lBRXJDOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsTUFBTTtJQUVaLENBQUM7Q0FDSixDQUFBO0FBVlksNEJBQTRCO0lBRnhDLGNBQUssQ0FBQyxXQUFXLENBQUM7SUFDbEIsZ0JBQU8sQ0FBQyw4QkFBOEIsQ0FBQztHQUMzQiw0QkFBNEIsQ0FVeEM7QUFWWSxvRUFBNEIifQ==