"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AppBootHook {
    constructor(app) {
        this.app = app;
    }
    configWillLoad() {
    }
    async willReady() {
        const rabbitMqSubscribeHandler = this.app.applicationContext.get('rabbitMqSubscribeHandler');
        rabbitMqSubscribeHandler.subscribe();
    }
}
exports.default = AppBootHook;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQXFCLFdBQVc7SUFHNUIsWUFBbUIsR0FBRztRQUNsQixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNuQixDQUFDO0lBRUQsY0FBYztJQUVkLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUztRQUNYLE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUM3Rix3QkFBd0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUN6QyxDQUFDO0NBQ0o7QUFmRCw4QkFlQyJ9