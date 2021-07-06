import { FreelogApplication } from 'egg-freelog-base';
import ContractInvalidTransitionRecordProvider from '../app/data-provider/contract-invalid-transition-record-provider';
export declare class ContractFsmEventPretreatment {
    app: FreelogApplication;
    contractInvalidTransitionRecordProvider: ContractInvalidTransitionRecordProvider;
}
