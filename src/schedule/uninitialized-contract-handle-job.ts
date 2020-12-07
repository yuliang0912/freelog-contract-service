import {isEmpty} from 'lodash';
import {IContractEventHandler} from '../interface';
import {provide, schedule, CommonSchedule, inject} from 'midway';
import {ContractEventEnum, ContractFsmRunningStatusEnum, ContractStatusEnum} from '../enum';

@provide()
@schedule(UninitializedContractHandleJob.scheduleOptions)
export class UninitializedContractHandleJob implements CommonSchedule {

    @inject()
    contractInfoProvider;
    @inject()
    contractEventHandler: IContractEventHandler;

    async exec(ctx) {

        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() - 3);

        const uninitializedContracts = await this.contractInfoProvider.find({
            status: ContractStatusEnum.Executed,
            fsmRunningStatus: ContractFsmRunningStatusEnum.Uninitialized,
            createDate: {$lt: expirationDate}
        }, null, {limit: 500, sort: {createDate: 1}});

        if (!isEmpty(uninitializedContracts)) {
            await this.contractEventHandler.handle(ContractEventEnum.InitialContractFsmEvent, uninitializedContracts);
        }
        return;
    }

    static get scheduleOptions() {
        return {
            cron: '*/5 * * * * *',
            type: 'worker',
            immediate: true, // 启动时是否立即执行一次
            disable: false
        };
    }
}
