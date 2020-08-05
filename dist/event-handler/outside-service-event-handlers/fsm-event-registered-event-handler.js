"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FsmEventRegisteredEventHandler = void 0;
const midway_1 = require("midway");
let FsmEventRegisteredEventHandler = class FsmEventRegisteredEventHandler {
    async handle() {
        return null;
    }
};
FsmEventRegisteredEventHandler = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('fsmEventRegisteredEventHandler')
], FsmEventRegisteredEventHandler);
exports.FsmEventRegisteredEventHandler = FsmEventRegisteredEventHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnNtLWV2ZW50LXJlZ2lzdGVyZWQtZXZlbnQtaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ldmVudC1oYW5kbGVyL291dHNpZGUtc2VydmljZS1ldmVudC1oYW5kbGVycy9mc20tZXZlbnQtcmVnaXN0ZXJlZC1ldmVudC1oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLG1DQUFzQztBQUt0QyxJQUFhLDhCQUE4QixHQUEzQyxNQUFhLDhCQUE4QjtJQUV2QyxLQUFLLENBQUMsTUFBTTtRQUNSLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7Q0FDSixDQUFBO0FBTFksOEJBQThCO0lBRjFDLGNBQUssQ0FBQyxXQUFXLENBQUM7SUFDbEIsZ0JBQU8sQ0FBQyxnQ0FBZ0MsQ0FBQztHQUM3Qiw4QkFBOEIsQ0FLMUM7QUFMWSx3RUFBOEIifQ==