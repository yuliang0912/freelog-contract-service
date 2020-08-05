import { IContractEventHandler } from '../interface';
import { CommonSchedule } from 'midway';
export declare class ContractAuthStatusSettingJob implements CommonSchedule {
    contractInfoProvider: any;
    contractEventHandler: IContractEventHandler;
    exec(ctx: any): Promise<void>;
    static get scheduleOptions(): {
        cron: string;
        type: string;
        immediate: boolean;
        disable: boolean;
    };
}
