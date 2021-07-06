"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoConditionBuilder = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
let MongoConditionBuilder = class MongoConditionBuilder {
    constructor() {
        this.condition = {};
    }
    _setProperty(field, value, options) {
        if (options?.isSetProperty === false) {
            return this;
        }
        if (lodash_1.isString(options?.operation)) {
            this.condition[field] = { [options.operation]: value };
        }
        else {
            this.condition[field] = value;
        }
        return this;
    }
    setString(field, value, options) {
        if (!lodash_1.isString(value)) {
            return this;
        }
        if (options?.isAllowEmptyArray === false && value.length === 0) {
            return this;
        }
        return this._setProperty(field, value, options);
    }
    setNumber(field, value, options) {
        if (!lodash_1.isNumber(value)) {
            return this;
        }
        return this._setProperty(field, value, options);
    }
    setArray(field, value, options) {
        if (!lodash_1.isArray(value)) {
            return this;
        }
        if (options?.isAllowEmptyArray === false && lodash_1.isEmpty(value)) {
            return this;
        }
        return this._setProperty(field, value, options);
    }
    setObject(field, value, options) {
        if (!lodash_1.isObject(value)) {
            return this;
        }
        return this._setProperty(field, value, options);
    }
    setRegex(field, value, options) {
        if (!lodash_1.isRegExp(value)) {
            return this;
        }
        return this._setProperty(field, value, options);
    }
    setAnyProperty(field, value, options) {
        if (!options.isSetProperty) {
            return this;
        }
        return this._setProperty(field, value, options);
    }
    verify(tips) {
        if (!lodash_1.isEmpty(Object.keys(this.condition))) {
            return this;
        }
        if (lodash_1.isError(tips)) {
            throw tips;
        }
        throw new Error(lodash_1.isString(tips) ? tips : 'arg is empty');
    }
    print() {
        console.log(this.condition);
        return this;
    }
    value() {
        return this.condition;
    }
    build() {
        return this.condition;
    }
};
MongoConditionBuilder = __decorate([
    midway_1.scope('Prototype'),
    midway_1.provide('mongoConditionBuilder')
], MongoConditionBuilder);
exports.MongoConditionBuilder = MongoConditionBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQtbW9uZ28tY29uZGl0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2V4dGVuZC9idWlsZC1tb25nby1jb25kaXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsbUNBQXlGO0FBQ3pGLG1DQUFzQztBQUt0QyxJQUFhLHFCQUFxQixHQUFsQyxNQUFhLHFCQUFxQjtJQUFsQztRQUVJLGNBQVMsR0FBRyxFQUFFLENBQUM7SUFvRm5CLENBQUM7SUFsRkcsWUFBWSxDQUFDLEtBQWEsRUFBRSxLQUFVLEVBQUUsT0FBcUM7UUFDekUsSUFBSSxPQUFPLEVBQUUsYUFBYSxLQUFLLEtBQUssRUFBRTtZQUNsQyxPQUFPLElBQUksQ0FBQztTQUNmO1FBQ0QsSUFBSSxpQkFBUSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsRUFBRTtZQUM5QixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsS0FBSyxFQUFDLENBQUM7U0FDeEQ7YUFBTTtZQUNILElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDO1NBQ2pDO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELFNBQVMsQ0FBQyxLQUFhLEVBQUUsS0FBYSxFQUFFLE9BQXFDO1FBQ3pFLElBQUksQ0FBQyxpQkFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2xCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFDRCxJQUFJLE9BQU8sRUFBRSxpQkFBaUIsS0FBSyxLQUFLLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDNUQsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUNELE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFRCxTQUFTLENBQUMsS0FB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