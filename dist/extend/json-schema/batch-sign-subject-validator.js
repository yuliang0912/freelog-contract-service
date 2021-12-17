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
exports.BatchSignSubjectValidator = void 0;
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
let BatchSignSubjectValidator = class BatchSignSubjectValidator extends egg_freelog_base_1.CommonJsonSchema {
    /**
     * 解决依赖资源格式校验
     * @param {object[]} operations 解决依赖资源数据
     */
    validate(operations) {
        return super.validate(operations, this.schemas['/signSubjectSchema']);
    }
    /**
     * 注册所有的校验
     * @private
     */
    registerValidators() {
        super.addSchema({
            id: '/signSubjectSchema',
            type: 'array',
            uniqueItems: true,
            items: {
                type: 'object',
                required: true,
                additionalProperties: false,
                properties: {
                    subjectId: { type: 'string', required: true, format: 'mongoObjectId' },
                    policyId: { type: 'string', required: true, format: 'md5' }
                }
            }
        });
    }
};
__decorate([
    (0, midway_1.init)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BatchSignSubjectValidator.prototype, "registerValidators", null);
BatchSignSubjectValidator = __decorate([
    (0, midway_1.scope)('Singleton'),
    (0, midway_1.provide)()
], BatchSignSubjectValidator);
exports.BatchSignSubjectValidator = BatchSignSubjectValidator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmF0Y2gtc2lnbi1zdWJqZWN0LXZhbGlkYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9leHRlbmQvanNvbi1zY2hlbWEvYmF0Y2gtc2lnbi1zdWJqZWN0LXZhbGlkYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBNEM7QUFDNUMsdURBQXVFO0FBSXZFLElBQWEseUJBQXlCLEdBQXRDLE1BQWEseUJBQTBCLFNBQVEsbUNBQWdCO0lBRTNEOzs7T0FHRztJQUNILFFBQVEsQ0FBQyxVQUFvQjtRQUN6QixPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFFRDs7O09BR0c7SUFFSCxrQkFBa0I7UUFDZCxLQUFLLENBQUMsU0FBUyxDQUFDO1lBQ1osRUFBRSxFQUFFLG9CQUFvQjtZQUN4QixJQUFJLEVBQUUsT0FBTztZQUNiLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLEtBQUssRUFBRTtnQkFDSCxJQUFJLEVBQUUsUUFBUTtnQkFDZCxRQUFRLEVBQUUsSUFBSTtnQkFDZCxvQkFBb0IsRUFBRSxLQUFLO2dCQUMzQixVQUFVLEVBQUU7b0JBQ1IsU0FBUyxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUM7b0JBQ3BFLFFBQVEsRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFDO2lCQUM1RDthQUNKO1NBQ0osQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKLENBQUE7QUFoQkc7SUFEQyxJQUFBLGFBQUksR0FBRTs7OzttRUFnQk47QUE5QlEseUJBQXlCO0lBRnJDLElBQUEsY0FBSyxFQUFDLFdBQVcsQ0FBQztJQUNsQixJQUFBLGdCQUFPLEdBQUU7R0FDRyx5QkFBeUIsQ0ErQnJDO0FBL0JZLDhEQUF5QiJ9