import { CommonSchedule } from 'midway';
import { FreelogContext } from 'egg-freelog-base';
import PolicyInfoProvider from '../app/data-provider/policy-info-provider';
import ContractInfoProvider from '../app/data-provider/contract-info-provider';
import { ContractFsmEventTransitionAfterHandler } from '../contract-fsm-service/contract-fsm-event-transition-after-handler';
export declare class ContractEventRegisterFailedHandleJob implements CommonSchedule {
    policyInfoProvider: PolicyInfoProvider;
    contractInfoProvider: ContractInfoProvider;
    contractFsmEventTransitionAfterHandler: ContractFsmEventTransitionAfterHandler;
    exec(ctx: FreelogContext): Promise<void>;
    static get scheduleOptions(): {
        cron: string;
        type: string;
        immediate: boolean;
        disable: boolean;
    };
}
