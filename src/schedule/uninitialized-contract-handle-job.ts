import {isEmpty} from 'lodash';
import {provide, schedule, CommonSchedule, inject} from 'midway';
import {ContractEventEnum, ContractFsmRunningStatusEnum, ContractStatusEnum} from '../enum';

const scheduleOptions = {
    cron: '0 */5 * * * *',
    type: 'worker',
    immediate: false, // 启动时是否立即执行一次
    disable: false
};

@provide()
@schedule(scheduleOptions)
export class UninitializedContractHandleJob implements CommonSchedule {

    @inject()
    contractInfoProvider;
    @inject()
    contractEventHandler;

    async exec(ctx) {

        const expirationDate = new Date()
        expirationDate.setMinutes(expirationDate.getMinutes() - 3);

        const uninitializedContracts = await this.contractInfoProvider.find({
            status: ContractStatusEnum.Executed,
            fsmRunningStatus: ContractFsmRunningStatusEnum.Uninitialized,
            createDate: {$lt: expirationDate}
        }, null, {limit: 500, sort: {createDate: 1}});

        if (!isEmpty(uninitializedContracts)) {
            await this.contractEventHandler.emitContractEvent(ContractEventEnum.InitialContractFsmEvent, uninitializedContracts);
        }
    }
}
