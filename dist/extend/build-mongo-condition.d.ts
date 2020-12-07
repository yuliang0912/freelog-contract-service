import { IMongoConditionBuilder, IMongoConditionBuildOptions } from '../interface';
export declare class MongoConditionBuilder implements IMongoConditionBuilder {
    condition: {};
    _setProperty(field: string, value: any, options?: IMongoConditionBuildOptions): IMongoConditionBuilder;
    setString(field: string, value: string, options?: IMongoConditionBuildOptions): IMongoConditionBuilder;
    setNumber(field: string, value: number, options?: IMongoConditionBuildOptions): IMongoConditionBuilder;
    setArray(field: string, value: any[], options?: IMongoConditionBuildOptions): IMongoConditionBuilder;
    setObject(field: string, value: object, options?: IMongoConditionBuildOptions): IMongoConditionBuilder;
    setRegex(field: string, value: RegExp, options?: IMongoConditionBuildOptions): IMongoConditionBuilder;
    setAnyProperty(field: string, value: any, options: IMongoConditionBuildOptions): IMongoConditionBuilder;
    verify(tips?: string | Error): IMongoConditionBuilder;
    print(): IMongoConditionBuilder;
    value(): object;
    build(): object;
}
