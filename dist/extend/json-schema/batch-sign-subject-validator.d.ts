import { IJsonSchemaValidate, CommonJsonSchema } from 'egg-freelog-base';
export declare class BatchSignSubjectValidator extends CommonJsonSchema implements IJsonSchemaValidate {
    /**
     * 解决依赖资源格式校验
     * @param {object[]} operations 解决依赖资源数据
     */
    validate(operations: object[]): import("jsonschema").ValidatorResult;
    /**
     * 注册所有的校验
     * @private
     */
    registerValidators(): void;
}
