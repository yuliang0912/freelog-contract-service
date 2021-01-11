import {provide, inject} from 'midway';
import {ArgumentError} from 'egg-freelog-base';
import {ContractFsmEventEnum, ContractFsmRunningStatusEnum} from '../../enum';
import {ContractInfo, PolicyInfo, IContractFsmEventHandler, FsmDescriptionInfo} from '../../interface';

@provide('contractFsmGenerator')
export class ContractFsmGenerator {

    @inject()
    contractStateMachineBuilder;
    @inject()
    contractFsmEventHandler: IContractFsmEventHandler;

    /**
     * 合同转换为可执行的状态机
     * @param contractInfo
     * @param contractPolicyInfo
     */
    contractWarpToFsm(contractInfo: ContractInfo, contractPolicyInfo: PolicyInfo) {
        if (!contractPolicyInfo) {
            throw new ArgumentError('param contractInfo.contractPolicyInfo is invalid');
        }
        try {
            return this.contractStateMachineBuilder
                .setFsmDescriptionInfo(contractPolicyInfo.fsmDescriptionInfo)
                .setAttachData({contractInfo})
                .setOnEnterStateEventHandle(this._onEnterStateEventHandle(contractPolicyInfo.fsmDescriptionInfo))
                .setInitialState(contractInfo.fsmCurrentState)
                .build();
        } catch (e) {
            console.log(e);
            // throw e;
        }
    }

    /**
     * 是否可以执行指定的事件
     * @param contractInfo
     * @param contractPolicyInfo
     * @param eventId
     */
    isCanExecEvent(contractInfo: ContractInfo, contractPolicyInfo: PolicyInfo, eventId: string): boolean {
        if (contractInfo.fsmRunningStatus === ContractFsmRunningStatusEnum.Locked) {
            return false;
        }
        return this.contractWarpToFsm(contractInfo, contractPolicyInfo).can(eventId);
    }

    // isCanExecEvent()

    _onEnterStateEventHandle(fsmDescriptionInfo: FsmDescriptionInfo): (lifeCycle, ...args) => void {
        return (lifeCycle, ...args) => {
            const {fsm, from, to} = lifeCycle;
            const history = fsm.history as string[];
            const contractInfo = fsm.contractInfo as ContractInfo;
            // 状态机默认初始化时,会触发一次从none到initialState的状态改变事件.此事件一般无意义,无需对事件作出回应
            if (history.length === 1 && ![ContractFsmRunningStatusEnum.Uninitialized, ContractFsmRunningStatusEnum.InitializedError].includes(contractInfo.fsmRunningStatus)) {
                return;
            }
            // fsm.fsmDescriptionInfo
            return this.contractFsmEventHandler.handle(ContractFsmEventEnum.FsmStateTransition, contractInfo, fsmDescriptionInfo, from, to, fsm.currEvent, ...args);
        };
    }
}
