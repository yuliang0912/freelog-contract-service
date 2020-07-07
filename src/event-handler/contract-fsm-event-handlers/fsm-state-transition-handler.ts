import {inject, provide, scope} from 'midway';
import {ContractInfo, IContractService, IEventHandler} from '../../interface';
import {ContractFsmRunningStatusEnum} from '../../enum';

/**
 * 合同状态机状态切换时的业务处理
 */
@scope('Singleton')
@provide('contractFsmStateTransitionHandler')
export class ContractFsmStateTransitionHandler implements IEventHandler {

    @inject()
    contractService: IContractService;

    /**
     * TODO: 前期: 1.合同加锁 2.获取环境变量值 3.计算表达式值 4.注册事件到注册中心
     * TODO: 中期: 1.等待事件全部注册成功  2.解锁合同
     * TODO: 后期: 1.修改合同状态  2:记录合同变更历史
     * @param lifeCycle
     * @returns {Promise<boolean>}
     */
    async handle(lifeCycle) {

        const toState = lifeCycle.to;
        const fromState = lifeCycle.from;
        const eventId = lifeCycle.fsm.currEvent.eventId;
        const contractInfo = lifeCycle.fsm.contractInfo as ContractInfo;
        const history = lifeCycle.fsm.history as string[];

        // 状态机默认初始化时,会触发一次从none到initialState的状态改变事件.此事件一般无意义,无需对事件作出实际数据变动
        if (history.length === 1 && contractInfo.fsmRunningStatus !== ContractFsmRunningStatusEnum.Uninitialized) {
            return;
        }
        console.log(fromState, toState, eventId);

        await this.contractService.addContractChangedHistory(contractInfo, fromState, toState, eventId, new Date()).then(console.log);
        // return this.contractService.updateContractInfo(contractInfo, {
        //     fsmCurrentState: toState,fsmRunningStatus:this._getContractFsmRunningStatus()
        // });
    }

    /**
     * 注册当下新状态下的事件,取消其他状态下的事件
     * @returns {Promise<null>}
     * @private
     */
    async _registerAndUnregisterContractEvents() {
        return null;
    }

    /**
     * 分析合同内容,获取合同状态机运行时的状态
     * @returns {Promise<void>}
     * @private
     */
    _getContractFsmRunningStatus(): ContractFsmRunningStatusEnum {
        return ContractFsmRunningStatusEnum.Running;
    }
}
