"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractFsmEventAnalysis = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
let ContractFsmEventAnalysis = class ContractFsmEventAnalysis {
    /**
     * 获取合同指定状态下的所有可注册事件
     * @param fsmDescriptionInfo
     * @param fsmCurrentState
     */
    getContractCanBeRegisteredEvents(fsmDescriptionInfo, fsmCurrentState) {
        const contractCanBeRegisteredEvents = [];
        const currentStateFsmDescriptionInfo = fsmDescriptionInfo[fsmCurrentState];
        if (!currentStateFsmDescriptionInfo) {
            throw new egg_freelog_base_1.LogicError(`please check code! current contract fsm is not exist stateName:[${fsmCurrentState}]`);
        }
        lodash_1.forIn(currentStateFsmDescriptionInfo.transition, (eventInfo, _nextState) => {
            if (eventInfo && this.getContractCanBeRegisteredEventCodes.includes(eventInfo.code)) {
                contractCanBeRegisteredEvents.push(eventInfo);
            }
        });
        return contractCanBeRegisteredEvents;
    }
    /**
     * 获取合同状态机下的所有可注册事件的编码
     * @returns {string[]}
     */
    get getContractCanBeRegisteredEventCodes() {
        return ['A101', 'A102', 'A103'];
    }
};
ContractFsmEventAnalysis = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('contractFsmEventAnalysis')
], ContractFsmEventAnalysis);
exports.ContractFsmEventAnalysis = ContractFsmEventAnalysis;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZnNtLWV2ZW50LWFuYWx5c2lzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2V4dGVuZC9jb250cmFjdC1jb21tb24tZ2VuZXJhdG9yL2NvbnRyYWN0LWZzbS1ldmVudC1hbmFseXNpcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxtQ0FBNkI7QUFDN0IsbUNBQXNDO0FBQ3RDLHVEQUE0QztBQUs1QyxJQUFhLHdCQUF3QixHQUFyQyxNQUFhLHdCQUF3QjtJQUVqQzs7OztPQUlHO0lBQ0gsZ0NBQWdDLENBQUMsa0JBQXNDLEVBQUUsZUFBdUI7UUFDNUYsTUFBTSw2QkFBNkIsR0FBRyxFQUFFLENBQUM7UUFDekMsTUFBTSw4QkFBOEIsR0FBRyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUMzRSxJQUFJLENBQUMsOEJBQThCLEVBQUU7WUFDakMsTUFBTSxJQUFJLDZCQUFVLENBQUMsbUVBQW1FLGVBQWUsR0FBRyxDQUFDLENBQUM7U0FDL0c7UUFDRCxjQUFLLENBQUMsOEJBQThCLENBQUMsVUFBVSxFQUFFLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxFQUFFO1lBQ3ZFLElBQUksU0FBUyxJQUFJLElBQUksQ0FBQyxvQ0FBb0MsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNqRiw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDakQ7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sNkJBQTZCLENBQUM7SUFDekMsQ0FBQztJQUVEOzs7T0FHRztJQUNILElBQUksb0NBQW9DO1FBQ3BDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3BDLENBQUM7Q0FDSixDQUFBO0FBNUJZLHdCQUF3QjtJQUZwQyxjQUFLLENBQUMsV0FBVyxDQUFDO0lBQ2xCLGdCQUFPLENBQUMsMEJBQTBCLENBQUM7R0FDdkIsd0JBQXdCLENBNEJwQztBQTVCWSw0REFBd0IifQ==