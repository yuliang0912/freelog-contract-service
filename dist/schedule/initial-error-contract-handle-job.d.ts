import { CommonSchedule } from 'midway';
import { FreelogContext } from 'egg-freelog-base';
import PolicyInfoProvider from '../app/data-provider/policy-info-provider';
import { ContractInfo, IContractStateMachine } from '../interface';
export declare class InitialErrorContractHandleJob implements CommonSchedule {
    contractInfoProvider: any;
    policyInfoProvider: PolicyInfoProvider;
    buildContractStateMachine: (contractInfo: ContractInfo) => IContractStateMachine;
    exec(ctx: FreelogContext): Promise<void>;
    static get scheduleOptions(): {
        cron: string;
        type: string;
        immediate: boolean;
        disable: boolean;
    };
}
