import {isEmpty} from 'lodash';
import {IContractEventHandler} from '../interface';
import {provide, schedule, CommonSchedule, inject} from 'midway';
import {ContractEventEnum, ContractFsmRunningStatusEnum, ContractStatusEnum} from '../enum';

@provide()
@schedule(InitialErrorContractHandleJob.scheduleOptions)
export class InitialErrorContractHandleJob implements CommonSchedule {

    @inject()
    contractInfoProvider;
    @inject()
    contractEventHandler: IContractEventHandler;

    async exec(ctx) {

        const initialErrorContracts = await this.contractInfoProvider.find({
            status: ContractStatusEnum.Executed,
            fsmRunningStatus: ContractFsmRunningStatusEnum.InitializedError
        }, null, {limit: 500, sort: {createDate: 1}});

        if (!isEmpty(initialErrorContracts)) {
            await this.contractEventHandler.handle(ContractEventEnum.InitialContractFsmEvent, initialErrorContracts);
        }
    }

    static get scheduleOptions() {
        return {
            cron: '0 */5 * * * *',
            type: 'worker',
            immediate: true, // 启动时是否立即执行一次
            disable: false
        };
    }
}
