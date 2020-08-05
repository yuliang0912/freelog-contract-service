"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AppBootHook {
    constructor(app) {
        this.app = app;
    }
    async willReady() {
        const rabbitMqSubscribeHandler = this.app.applicationContext.get('rabbitMqSubscribeHandler');
        rabbitMqSubscribeHandler.subscribe();
    }
}
exports.default = AppBootHook;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQXFCLFdBQVc7SUFHNUIsWUFBbUIsR0FBRztRQUNsQixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNuQixDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVM7UUFDWCxNQUFNLHdCQUF3QixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDN0Ysd0JBQXdCLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDekMsQ0FBQztDQUNKO0FBWEQsOEJBV0MifQ==