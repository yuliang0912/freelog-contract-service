import { CommonSchedule } from 'midway';
import PolicyInfoProvider from '../app/data-provider/policy-info-provider';
import { ContractInfo, IContractStateMachine } from '../interface';
import { MongoClient } from 'mongodb';
export declare class UninitializedContractHandleJob implements CommonSchedule {
    mongoose: MongoClient;
    contractInfoProvider: any;
    policyInfoProvider: PolicyInfoProvider;
    buildContractStateMachine: (contractInfo: ContractInfo) => IContractStateMachine;
    exec(ctx: any): Promise<void>;
    static get scheduleOptions(): {
        cron: string;
        type: string;
        immediate: boolean;
        disable: boolean;
    };
}
