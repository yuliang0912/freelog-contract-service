/// <reference types="lodash" />
import { MongooseModelBase } from 'egg-freelog-base/database/mongoose-model-base';
export declare class ContractInfoModel extends MongooseModelBase {
    constructor(mongoose: any);
    buildMongooseModel(): any;
    static get toObjectOptions(): {
        getters: boolean;
        virtuals: boolean;
        transform(doc: any, ret: any): {
            contractId: any;
        } & import("lodash").Omit<any, "id" | "_id" | "sortId" | "signature" | "uniqueKey">;
    };
}
