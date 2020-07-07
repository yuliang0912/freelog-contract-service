import {provide, scope, inject} from 'midway';
import {ApplicationError} from 'egg-freelog-base';
import {ContractInfo, IEventHandler} from '../../interface';
import {ContractAuthStatusEnum, ContractFsmRunningStatusEnum} from '../../enum';

@scope('Singleton')
@provide('initialContractEventHandler')
export class InitialContractEventHandler implements IEventHandler {

    @inject()
    contractFsmGenerator;

    /**
     * TODO: 1.对合同实例化时的参数进行解析并且赋值,保存到contractInfo.fsmDeclarations中
     * TODO: 2.分析出状态机中描述信息中的初始态名称,并且赋值.
     * TODO: 3.把合同转换成状态机.然后后续的事件处理,由统一的状态机事件系统介入.
     */
    async handle(contractInfo: ContractInfo) {
        if (!contractInfo.contractId || contractInfo.fsmRunningStatus !== ContractFsmRunningStatusEnum.Uninitialized) {
            return false;
        }
        if (contractInfo.authStatus !== ContractAuthStatusEnum.Unknown) {
            throw new ApplicationError('please check contract data. contract.authStatus is invalid');
        }
        // 目前初始态的状态名固定为init或initial (后续规则也可能修改为第一个)
        contractInfo.fsmCurrentState = Object.keys(contractInfo.contractPolicyInfo.fsmDescriptionInfo).find(x => /^(init|initial)$/i.test(x));

        this.contractFsmGenerator.contractWarpToFsm(contractInfo);
    }
}
