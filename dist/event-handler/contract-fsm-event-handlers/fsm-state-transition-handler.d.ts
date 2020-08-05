import { ContractFsmRunningStatusEnum } from '../../enum';
import { ContractInfo, IContractService, IEventHandler } from '../../interface';
/**
 * 合同状态机状态切换时的业务处理
 */
export declare class ContractFsmStateTransitionHandler implements IEventHandler {
    contractFsmEventAnalysis: any;
    contractService: IContractService;
    /**
     * TODO: 前期: 1.合同加锁并且记录合同变更历史(需要事务保证原子性) 2.获取环境变量值 3.计算表达式值
     * TODO: 中期: 1.注册事件到注册中心(幂等性支持) 2.等待事件全部注册成功  2.解锁合同
     * TODO: 后期: 1.修改合同各种状态(如果前置步骤失败了,可以通过job继续触发,所以需要保证合同历史记录中有对应的事件信息)
     * @param {ContractInfo} contractInfo
     * @param {string} fromState
     * @param {string} toState
     * @param currEvent
     * @returns {Promise<void>}
     */
    handle(contractInfo: ContractInfo, fsmDescriptionInfo: object, fromState: string, toState: string, currEvent: any): Promise<void>;
    /**
     * 注册当下新状态下的事件,取消其他状态下的事件
     * 实现逻辑:合同服务批量一次性注册当前运行状态下的所有可注册事件.
     * 注册服务批量接收到所有可注册的事件.然后首先删除当前合约ID下的所有已注册事件.然后重新注册新的事件集
     * 区别于上一版本,此版本不再明确发送取消注册的事件
     * @returns {Promise<null>}
     * @private
     */
    _registerAndUnregisterContractEvents(contractInfo: ContractInfo, fsmDescriptionInfo: object): Promise<any>;
    /**
     * 分析合同内容,获取合同状态机运行时的状态
     * @returns {Promise<void>}
     * @private
     */
    _getContractFsmRunningStatus(): ContractFsmRunningStatusEnum;
}
