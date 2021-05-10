import {CommonSchedule, inject, provide, schedule} from 'midway';
import {FreelogContext} from 'egg-freelog-base';
import PolicyInfoProvider from '../app/data-provider/policy-info-provider';
import ContractInfoProvider from '../app/data-provider/contract-info-provider';
import {ContractFsmRunningStatusEnum} from '../enum';
import {ContractFsmEventTransitionAfterHandler} from '../contract-fsm-service/contract-fsm-event-transition-after-handler';
import {isEmpty, pick} from 'lodash';

@provide()
@schedule(ContractEventRegisterFailedHandleJob.scheduleOptions)
export class ContractEventRegisterFailedHandleJob implements CommonSchedule {

    @inject()
    policyInfoProvider: PolicyInfoProvider;
    @inject()
    contractInfoProvider: ContractInfoProvider;
    @inject()
    contractFsmEventTransitionAfterHandler: ContractFsmEventTransitionAfterHandler;

    async exec(ctx: FreelogContext) {
        const registerFailedContracts = await this.contractInfoProvider.find({
            fsmRunningStatus: ContractFsmRunningStatusEnum.ToBeRegisteredEvents
        }, null, {limit: 500, sort: {_id: 1}});

        if (isEmpty(registerFailedContracts)) {
            return;
        }

        const policyMap = await this.policyInfoProvider.find({policyId: {$in: registerFailedContracts.map(x => x.policyId)}}).then(list => {
            return new Map(list.map(x => [x.policyId, x]));
        });

        for (const contractInfo of registerFailedContracts) {
            contractInfo.policyInfo = policyMap.get(contractInfo.policyId);
            const toBeRegisterEventInfos = this.contractFsmEventTransitionAfterHandler.getCanRegisterEvents(contractInfo, contractInfo.fsmCurrentState);
            const eventBody = toBeRegisterEventInfos.map(eventInfo => pick(eventInfo, ['service', 'name', 'code', 'eventId', 'args']));
            this.contractFsmEventTransitionAfterHandler.sendContractRegisterEventToKafka(contractInfo, eventBody).then(() => {
                return this.contractInfoProvider.updateOne({_id: contractInfo.contractId}, {
                    fsmRunningStatus: ContractFsmRunningStatusEnum.Running
                });
            }).catch(() => null);
        }
    }

    static get scheduleOptions() {
        return {
            cron: '0 */2 * * * *',
            type: 'worker',
            immediate: true, // 启动时是否立即执行一次
            disable: false
        };
    }
}
