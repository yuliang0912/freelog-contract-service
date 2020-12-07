import {isString, isNumber, isArray, isEmpty, isRegExp, isError, isObject} from 'lodash';
import {provide, scope} from 'midway';
import {IMongoConditionBuilder, IMongoConditionBuildOptions} from '../interface';

@scope('Prototype')
@provide('mongoConditionBuilder')
export class MongoConditionBuilder implements IMongoConditionBuilder {

    condition = {};

    _setProperty(field: string, value: any, options?: IMongoConditionBuildOptions): IMongoConditionBuilder {
        if (options?.isSetProperty === false) {
            return this;
        }
        if (isString(options?.operation)) {
            this.condition[field] = {[options.operation]: value};
        } else {
            this.condition[field] = value;
        }
        return this;
    }

    setString(field: string, value: string, options?: IMongoConditionBuildOptions): IMongoConditionBuilder {
        if (!isString(value)) {
            return this;
        }
        if (options?.isAllowEmptyArray === false && value.length === 0) {
            return this;
        }
        return this._setProperty(field, value, options);
    }

    setNumber(field: string, value: number, options?: IMongoConditionBuildOptions): IMongoConditionBuilder {
        if (!isNumber(value)) {
            return this;
        }
        return this._setProperty(field, value, options);
    }

    setArray(field: string, value: any[], options?: IMongoConditionBuildOptions): IMongoConditionBuilder {
        if (!isArray(value)) {
            return this;
        }
        if (options?.isAllowEmptyArray === false && isEmpty(value)) {
            return this;
        }
        return this._setProperty(field, value, options);
    }

    setObject(field: string, value: object, options?: IMongoConditionBuildOptions): IMongoConditionBuilder {
        if (!isObject(value)) {
            return this;
        }
        return this._setProperty(field, value, options);
    }

    setRegex(field: string, value: RegExp, options?: IMongoConditionBuildOptions): IMongoConditionBuilder {
        if (!isRegExp(value)) {
            return this;
        }
        return this._setProperty(field, value, options);
    }

    setAnyProperty(field: string, value: any, options: IMongoConditionBuildOptions): IMongoConditionBuilder {
        if (!options.isSetProperty) {
            return this;
        }
        return this._setProperty(field, value, options);
    }

    verify(tips?: string | Error): IMongoConditionBuilder {
        if (!isEmpty(Object.keys(this.condition))) {
            return this;
        }
        if (isError(tips)) {
            throw tips;
        }
        throw new Error(isString(tips) ? tips : 'arg is empty');
    }

    print(): IMongoConditionBuilder {
        console.log(this.condition);
        return this;
    }

    value(): object {
        return this.condition;
    }

    build(): object {
        return this.condition;
    }
}
