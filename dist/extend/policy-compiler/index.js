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
const presentable_policy_compiler_1 = require("./presentable-policy-compiler");
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
    compiler(subjectType, policyText) {
        if (!this.subjectPolicyCompilerMap.has(subjectType)) {
            throw new egg_freelog_base_1.ApplicationError(`unsupported subjectType:${subjectType}`);
        }
        return this.subjectPolicyCompilerMap.get(subjectType).compiler(subjectType, policyText);
    }
    initialSubjectPolicyCompiler() {
        this.subjectPolicyCompilerMap.set(enum_1.SubjectType.Resource, new resource_policy_compiler_1.ResourcePolicyCompiler());
        this.subjectPolicyCompilerMap.set(enum_1.SubjectType.Presentable, new presentable_policy_compiler_1.PresentablePolicyCompiler());
    }
};
__decorate([
    midway_1.init(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PolicyCompiler.prototype, "initialSubjectPolicyCompiler", null);
PolicyCompiler = __decorate([
    midway_1.provide(),
    midway_1.scope('Singleton')
], PolicyCompiler);
exports.PolicyCompiler = PolicyCompiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXh0ZW5kL3BvbGljeS1jb21waWxlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBdUM7QUFDdkMsbUNBQTRDO0FBRTVDLHlFQUFrRTtBQUNsRSwrRUFBd0U7QUFDeEUsdURBQWtEO0FBSWxELElBQWEsY0FBYyxHQUEzQixNQUFhLGNBQWM7SUFBM0I7UUFFYSw2QkFBd0IsR0FBRyxJQUFJLEdBQUcsRUFBZ0MsQ0FBQztJQW9CaEYsQ0FBQztJQWxCRzs7Ozs7T0FLRztJQUNILFFBQVEsQ0FBQyxXQUF3QixFQUFFLFVBQWtCO1FBQ2pELElBQUksQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ2pELE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQywyQkFBMkIsV0FBVyxFQUFFLENBQUMsQ0FBQztTQUN4RTtRQUNELE9BQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzVGLENBQUM7SUFHRCw0QkFBNEI7UUFDeEIsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxrQkFBVyxDQUFDLFFBQVEsRUFBRSxJQUFJLGlEQUFzQixFQUFFLENBQUMsQ0FBQztRQUN0RixJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLGtCQUFXLENBQUMsV0FBVyxFQUFFLElBQUksdURBQXlCLEVBQUUsQ0FBQyxDQUFDO0lBQ2hHLENBQUM7Q0FDSixDQUFBO0FBSkc7SUFEQyxhQUFJLEVBQUU7Ozs7a0VBSU47QUFyQlEsY0FBYztJQUYxQixnQkFBTyxFQUFFO0lBQ1QsY0FBSyxDQUFDLFdBQVcsQ0FBQztHQUNOLGNBQWMsQ0FzQjFCO0FBdEJZLHdDQUFjIn0=