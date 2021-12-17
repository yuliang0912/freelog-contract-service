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
    condition = {};
    _setProperty(field, value, options) {
        if (options?.isSetProperty === false) {
            return this;
        }
        if ((0, lodash_1.isString)(options?.operation)) {
            this.condition[field] = { [options.operation]: value };
        }
        else {
            this.condition[field] = value;
        }
        return this;
    }
    setString(field, value, options) {
        if (!(0, lodash_1.isString)(value)) {
            return this;
        }
        if (options?.isAllowEmptyArray === false && value.length === 0) {
            return this;
        }
        return this._setProperty(field, value, options);
    }
    setNumber(field, value, options) {
        if (!(0, lodash_1.isNumber)(value)) {
            return this;
        }
        return this._setProperty(field, value, options);
    }
    setArray(field, value, options) {
        if (!(0, lodash_1.isArray)(value)) {
            return this;
        }
        if (options?.isAllowEmptyArray === false && (0, lodash_1.isEmpty)(value)) {
            return this;
        }
        return this._setProperty(field, value, options);
    }
    setObject(field, value, options) {
        if (!(0, lodash_1.isObject)(value)) {
            return this;
        }
        return this._setProperty(field, value, options);
    }
    setRegex(field, value, options) {
        if (!(0, lodash_1.isRegExp)(value)) {
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
        if (!(0, lodash_1.isEmpty)(Object.keys(this.condition))) {
            return this;
        }
        if ((0, lodash_1.isError)(tips)) {
            throw tips;
        }
        throw new Error((0, lodash_1.isString)(tips) ? tips : 'arg is empty');
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
    (0, midway_1.scope)('Prototype'),
    (0, midway_1.provide)('mongoConditionBuilder')
], MongoConditionBuilder);
exports.MongoConditionBuilder = MongoConditionBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQtbW9uZ28tY29uZGl0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2V4dGVuZC9idWlsZC1tb25nby1jb25kaXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsbUNBQXlGO0FBQ3pGLG1DQUFzQztBQUt0QyxJQUFhLHFCQUFxQixHQUFsQyxNQUFhLHFCQUFxQjtJQUU5QixTQUFTLEdBQUcsRUFBRSxDQUFDO0lBRWYsWUFBWSxDQUFDLEtBQWEsRUFBRSxLQUFVLEVBQUUsT0FBcUM7UUFDekUsSUFBSSxPQUFPLEVBQUUsYUFBYSxLQUFLLEtBQUssRUFBRTtZQUNsQyxPQUFPLElBQUksQ0FBQztTQUNmO1FBQ0QsSUFBSSxJQUFBLGlCQUFRLEVBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxFQUFFO1lBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxLQUFLLEVBQUMsQ0FBQztTQUN4RDthQUFNO1lBQ0gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUM7U0FDakM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsU0FBUyxDQUFDLEtBQWEsRUFBRSxLQUFhLEVBQUUsT0FBcUM7UUFDekUsSUFBSSxDQUFDLElBQUEsaUJBQVEsRUFBQyxLQUFLLENBQUMsRUFBRTtZQUNsQixPQUFPLElBQUksQ0FBQztTQUNmO1FBQ0QsSUFBSSxPQUFPLEVBQUUsaUJBQWlCLEtBQUssS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQzVELE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFDRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQsU0FBUyxDQUFDLEtBQWEsRUFBRSxL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