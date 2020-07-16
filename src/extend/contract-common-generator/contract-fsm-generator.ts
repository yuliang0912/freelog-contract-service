import {isString} from 'lodash';
import {provide, inject} from 'midway';
import {ContractInfo, ContractPolicyInfo, IContractFsmEventHandler} from '../../interface';
import {ArgumentError} from 'egg-freelog-base';
import {ContractFsmEventEnum, ContractFsmRunningStatusEnum} from '../../enum';

@provide('contractFsmGenerator')
export class ContractFsmGenerator {

    @inject()
    contractFsmEventHandler: IContractFsmEventHandler;
    @inject()
    contractStateMachineBuilder;

    contractWarpToFsm(contractInfo: ContractInfo, contractPolicyInfo: ContractPolicyInfo) {
        if (!contractPolicyInfo) {
            throw new ArgumentError('param contractInfo.contractPolicyInfo is invalid');
        }

        const builder = this.contractStateMachineBuilder
            .setFsmDescriptionInfo(contractPolicyInfo.fsmDescriptionInfo)
            .setAttachData({contractInfo})
            .setOnEnterStateEventHandle(this._onEnterStateEventHandle());
        if (isString(contractInfo.fsmCurrentState)) {
            builder.setInitialState(contractInfo.fsmCurrentState);
        }
        return builder.build();
    }

    isCanExecEvent(contractInfo: ContractInfo, contractPolicyInfo: ContractPolicyInfo, eventId: string): boolean {
        if (contractInfo.fsmRunningStatus === ContractFsmRunningStatusEnum.Locked) {
            return false;
        }
        return this.contractWarpToFsm(contractInfo, contractPolicyInfo).can(eventId);
    }

    _onEnterStateEventHandle(): (lifeCycle, ...args) => void {
        return (lifeCycle, ...args) => {
            return this.contractFsmEventHandler.handle(ContractFsmEventEnum.FsmStateTransition, lifeCycle, ...args);
        };
    }
}
