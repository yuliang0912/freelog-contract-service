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
exports.PolicyCompiler = void 0;
const enum_1 = require("../../enum");
const midway_1 = require("midway");
const resource_policy_compiler_1 = require("./resource-policy-compiler");
const egg_freelog_base_1 = require("egg-freelog-base");
let PolicyCompiler = class PolicyCompiler {
    constructor() {
        this.subjectPolicyCompilerMap = new Map();
    }
    /**
     * 根据标的物类型编译策略文本
     * @param subjectType
     * @param policyText
     * @param policyName
     */
    compiler(userId, subjectType, policyText, policyName) {
        if (!this.subjectPolicyCompilerMap.has(subjectType)) {
            throw new egg_freelog_base_1.ApplicationError(`unsupported subjectType:${subjectType}`);
        }
        return this.subjectPolicyCompilerMap.get(subjectType).compiler(userId, subjectType, policyText, policyName);
    }
    initialSubjectPolicyCompiler() {
        this.subjectPolicyCompilerMap.set(enum_1.SubjectType.Resource, new resource_policy_compiler_1.ResourcePolicyCompiler());
    }
};
__decorate([
    midway_1.init(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PolicyCompiler.prototype, "initialSubjectPolicyCompiler", null);
PolicyCompiler = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('policyCompiler')
], PolicyCompiler);
exports.PolicyCompiler = PolicyCompiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXh0ZW5kL3BvbGljeS1jb21waWxlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBdUM7QUFDdkMsbUNBQTRDO0FBRTVDLHlFQUFrRTtBQUNsRSx1REFBa0Q7QUFJbEQsSUFBYSxjQUFjLEdBQTNCLE1BQWEsY0FBYztJQUEzQjtRQUVhLDZCQUF3QixHQUFHLElBQUksR0FBRyxFQUFnQyxDQUFDO0lBbUJoRixDQUFDO0lBakJHOzs7OztPQUtHO0lBQ0gsUUFBUSxDQUFDLE1BQWMsRUFBRSxXQUF3QixFQUFFLFVBQWtCLEVBQUUsVUFBa0I7UUFDckYsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDakQsTUFBTSxJQUFJLG1DQUFnQixDQUFDLDJCQUEyQixXQUFXLEVBQUUsQ0FBQyxDQUFDO1NBQ3hFO1FBQ0QsT0FBTyxJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNoSCxDQUFDO0lBR0QsNEJBQTRCO1FBQ3hCLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsa0JBQVcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxpREFBc0IsRUFBRSxDQUFDLENBQUM7SUFDMUYsQ0FBQztDQUNKLENBQUE7QUFIRztJQURDLGFBQUksRUFBRTs7OztrRUFHTjtBQXBCUSxjQUFjO0lBRjFCLGNBQUssQ0FBQyxXQUFXLENBQUM7SUFDbEIsZ0JBQU8sQ0FBQyxnQkFBZ0IsQ0FBQztHQUNiLGNBQWMsQ0FxQjFCO0FBckJZLHdDQUFjIn0=