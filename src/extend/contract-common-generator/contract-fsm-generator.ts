import {isString} from 'lodash';
import {provide, inject} from 'midway';
import {ContractInfo} from '../../interface';
import {ArgumentError} from 'egg-freelog-base';
import {ContractFsmEventEnum} from '../../enum';

@provide('contractFsmGenerator')
export class ContractFsmGenerator {

    @inject()
    contractEventHandler;
    @inject()
    contractStateMachineBuilder;

    contractWarpToFsm(contractInfo: ContractInfo) {
        if (!contractInfo.contractPolicyInfo) {
            throw new ArgumentError('param contractInfo.contractPolicyInfo is invalid');
        }

        const builder = this.contractStateMachineBuilder
            .setFsmDescriptionInfo(contractInfo.contractPolicyInfo.fsmDescriptionInfo)
            .setAttachData({contractInfo})
            .setOnEnterStateEventHandle(this._onEnterStateEventHandle());
        if (isString(contractInfo.fsmCurrentState)) {
            builder.setInitialState(contractInfo.fsmCurrentState);
        }
        return builder.build();
    }

    _onEnterStateEventHandle(): (lifeCycle, ...args) => void {
        return (lifeCycle, ...args) => {
            return this.contractEventHandler.emitContractFsmEventHandle(ContractFsmEventEnum.FsmStateTransition, lifeCycle, ...args);
        };
    }
}
