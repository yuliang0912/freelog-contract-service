import {isEmpty} from 'lodash';
import {provide, schedule, CommonSchedule, inject} from 'midway';
import {ContractFsmRunningStatusEnum} from '../enum';
import {ContractStatusEnum, FreelogContext} from 'egg-freelog-base';
import PolicyInfoProvider from '../app/data-provider/policy-info-provider';
import {ContractInfo, IContractStateMachine} from '../interface';

@provide()
@schedule(InitialErrorContractHandleJob.scheduleOptions)
export class InitialErrorContractHandleJob implements CommonSchedule {

    @inject()
    contractInfoProvider;
    @inject()
    policyInfoProvider: PolicyInfoProvider;
    @inject()
    buildContractStateMachine: (contractInfo: ContractInfo) => IContractStateMachine;

    async exec(ctx: FreelogContext) {
        const initialErrorContracts = await this.contractInfoProvider.find({
            status: ContractStatusEnum.Executed,
            fsmRunningStatus: ContractFsmRunningStatusEnum.InitializedError
        }, null, {limit: 500, sort: {createDate: 1}});

        if (isEmpty(initialErrorContracts)) {
            return;
        }

        const policyMap = await this.policyInfoProvider.find({policyId: {$in: initialErrorContracts.map(x => x.policyId)}}).then(list => {
            return new Map(list.map(x => [x.policyId, x]));
        });

        for (const contract of initialErrorContracts) {
            contract.policyInfo = policyMap.get(contract.policyId);
            const session = await this.contractInfoProvider.model.startSession();
            await session.withTransaction(async () => {
                return this.buildContractStateMachine(contract).execInitial(session);
            }).catch(error => {
            }).finally(() => {
                session.endSession();
            });
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
