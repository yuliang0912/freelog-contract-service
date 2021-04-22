import {isEmpty} from 'lodash';
import {ContractFsmRunningStatusEnum} from '../enum';
import {ContractStatusEnum} from 'egg-freelog-base';
import {provide, schedule, CommonSchedule, inject, plugin} from 'midway';
import PolicyInfoProvider from '../app/data-provider/policy-info-provider';
import {ContractInfo, IContractStateMachine} from '../interface';
import {MongoClient} from 'mongodb';

@provide()
@schedule(UninitializedContractHandleJob.scheduleOptions)
export class UninitializedContractHandleJob implements CommonSchedule {

    @plugin()
    mongoose: MongoClient;
    @inject()
    contractInfoProvider;
    @inject()
    policyInfoProvider: PolicyInfoProvider;
    @inject()
    buildContractStateMachine: (contractInfo: ContractInfo) => IContractStateMachine;

    async exec(ctx) {

        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() - 3);

        const uninitializedContracts = await this.contractInfoProvider.find({
            status: ContractStatusEnum.Executed,
            fsmRunningStatus: ContractFsmRunningStatusEnum.Uninitialized,
            createDate: {$lt: expirationDate}
        }, null, {limit: 500, sort: {createDate: 1}});

        if (isEmpty(uninitializedContracts)) {
            return;
        }

        const policyMap = await this.policyInfoProvider.find({policyId: {$in: uninitializedContracts.map(x => x.policyId)}}).then(list => {
            return new Map(list.map(x => [x.policyId, x]));
        });
        for (const contract of uninitializedContracts) {
            contract.policyInfo = policyMap.get(contract.policyId);
            const session = await this.mongoose.startSession();
            await session.withTransaction(async () => {
                return this.buildContractStateMachine(contract).execInitial(session);
            }).catch(() => {
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
