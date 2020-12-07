import { MongooseModelBase } from './mongoose-model-base';
export declare class ContractInfoModel extends MongooseModelBase {
    buildMongooseModel(): any;
    static get toObjectOptions(): {
        getters: boolean;
        virtuals: boolean;
        transform(doc: any, ret: any): {
            contractId: any;
        } & Pick<any, string | number | symbol>;
    };
}
