import {isEmpty} from 'lodash';
import {provide, schedule, CommonSchedule, inject} from 'midway';
import {ContractAuthStatusEnum, ContractFsmRunningStatusEnum, ContractStatusEnum} from '../enum';

const scheduleOptions = {
    cron: '0 */3 * * * *',
    type: 'worker',
    immediate: false, // 启动时是否立即执行一次
    disable: false
};

@provide()
@schedule(scheduleOptions)
export class ContractAuthStatusSettingJob implements CommonSchedule {

    @inject()
    contractInfoProvider;
    @inject()
    contractEventHandler;

    async exec(ctx) {

        const unknownAuthStatusContracts = await this.contractInfoProvider.find({
            status: ContractStatusEnum.Executed,
            fsmRunningStatus: ContractFsmRunningStatusEnum.Running,
            authStatus: ContractAuthStatusEnum.Unknown
        }, null, {limit: 500, sort: {createDate: 1}});

        if (!isEmpty(unknownAuthStatusContracts)) {
            console.log(`未知授权状态的合约数量:${unknownAuthStatusContracts.length}`);
        }
    }
}
