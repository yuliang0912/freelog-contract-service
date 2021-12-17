"use strict";
// import {KafkaStartup} from "./kafka/startup";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("egg-freelog-base/database/mongoose");
/**
 * https://eggjs.org/zh-cn/basics/app-start.html
 */
class AppBootHook {
    app;
    constructor(app) {
        this.app = app;
    }
    async willReady() {
        await (0, mongoose_1.default)(this.app).then(() => {
            return this.app.applicationContext.getAsync('kafkaStartup');
        });
    }
    async beforeClose() {
        const kafkaClient = await this.app.applicationContext.getAsync('kafkaClient');
        await kafkaClient.disconnect();
    }
}
exports.default = AppBootHook;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsZ0RBQWdEOztBQUtoRCxpRUFBMEQ7QUFFMUQ7O0dBRUc7QUFDSCxNQUFxQixXQUFXO0lBRTVCLEdBQUcsQ0FBQztJQUVKLFlBQVksR0FBdUI7UUFDL0IsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDbkIsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTO1FBQ1gsTUFBTSxJQUFBLGtCQUFRLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDL0IsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNoRSxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxLQUFLLENBQUMsV0FBVztRQUNiLE1BQU0sV0FBVyxHQUFnQixNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzNGLE1BQU0sV0FBVyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ25DLENBQUM7Q0FDSjtBQWxCRCw4QkFrQkMifQ==