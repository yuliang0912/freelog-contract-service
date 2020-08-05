"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractPolicyCompiler = void 0;
const midway_1 = require("midway");
let ContractPolicyCompiler = class ContractPolicyCompiler {
    /**
     * 编译策略文本
     * @param policyText
     * @param policyName
     * @returns {ContractPolicyInfo}
     */
    compilePolicyText(policyText) {
        return {
            subjectType: 1,
            policyId: '8cefe2f1dcc6dd0bdaadac946cb63dbc',
            policyText: 'for public:\n  initial:\n    active\n   presentable\n    terminate',
            fsmDescriptionInfo: {
                initial: {
                    authorization: [
                        'active', 'presentable'
                    ],
                    transition: {
                        terminate: null
                    }
                }
            }
        };
    }
};
ContractPolicyCompiler = __decorate([
    midway_1.provide('contractPolicyCompiler')
], ContractPolicyCompiler);
exports.ContractPolicyCompiler = ContractPolicyCompiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtcG9saWN5LWNvbXBpbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2V4dGVuZC9jb250cmFjdC1jb21tb24tZ2VuZXJhdG9yL2NvbnRyYWN0LXBvbGljeS1jb21waWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxtQ0FBK0I7QUFJL0IsSUFBYSxzQkFBc0IsR0FBbkMsTUFBYSxzQkFBc0I7SUFFL0I7Ozs7O09BS0c7SUFDSCxpQkFBaUIsQ0FBQyxVQUFVO1FBQ3hCLE9BQU87WUFDSCxXQUFXLEVBQUUsQ0FBQztZQUNkLFFBQVEsRUFBRSxrQ0FBa0M7WUFDNUMsVUFBVSxFQUFFLG9FQUFvRTtZQUNoRixrQkFBa0IsRUFBRTtnQkFDaEIsT0FBTyxFQUFFO29CQUNMLGFBQWEsRUFBRTt3QkFDWCxRQUFRLEVBQUUsYUFBYTtxQkFDMUI7b0JBQ0QsVUFBVSxFQUFFO3dCQUNSLFNBQVMsRUFBRSxJQUFJO3FCQUNsQjtpQkFDSjthQUNKO1NBQ0osQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFBO0FBekJZLHNCQUFzQjtJQURsQyxnQkFBTyxDQUFDLHdCQUF3QixDQUFDO0dBQ3JCLHNCQUFzQixDQXlCbEM7QUF6Qlksd0RBQXNCIn0=