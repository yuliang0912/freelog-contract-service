/// <reference types="lodash" />
import { MongooseModelBase } from 'egg-freelog-base/database/mongoose-model-base';
export declare class ContractInvalidTransitionModel extends MongooseModelBase {
    constructor(mongoose: any);
    buildMongooseModel(): any;
    static get toObjectOptions(): {
        transform(doc: any, ret: any): {
            contractId: any;
        } & import("lodash").Omit<any, "id" | "_id">;
    };
}
