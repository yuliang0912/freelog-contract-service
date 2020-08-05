import * as queue from 'async/queue';
import {provide, scope, inject} from 'midway';
import {ApplicationError} from 'egg-freelog-base';
import {ContractInfo, PolicyInfo, IEventHandler, IPolicyService, IContractService} from '../../interface';
import {ContractAuthStatusEnum, ContractFsmRunningStatusEnum} from '../../enum';

@scope('Singleton')
@provide('initialContractEventHandler')
export class InitialContractEventHandler implements IEventHandler {

    private _queue;
    readonly MAX_QUEUE_TASK_COUNT = 50;
    @inject()
    contractFsmGenerator;
    @inject()
    policyService: IPolicyService;
    @inject()
    contractService: IContractService;

    get taskQueue() {
        if (!this._queue) {
            this._queue = queue(this._initialContract.bind(this), this.MAX_QUEUE_TASK_COUNT);
        }
        return this._queue;
    }

    /**
     * TODO: 1.对合同实例化时的参数进行解析并且赋值,保存到contractInfo.fsmDeclarations中
     * TODO: 2.分析出状态机中描述信息中的初始态名称,并且赋值.
     * TODO: 3.把合同转换成状态机.然后后续的事件处理,由统一的状态机事件系统介入.
     * TODO: 后续服务需要提供定时JOB,用于扫描状态为Uninitialized或InitializedError的合约.然后对其初始化,防止部分合约初始化失败.
     */
    async handle(contractInfos: ContractInfo[]) {
        const contractPolicyMap: Map<string, PolicyInfo> = await this.policyService.findByIds(contractInfos.map(x => x.policyId))
            .then(list => new Map(list.map(x => [x.policyId, x])));
        contractInfos.forEach(contractInfo => {
            if (!contractInfo.contractId || ![ContractFsmRunningStatusEnum.Uninitialized, ContractFsmRunningStatusEnum.InitializedError].includes(contractInfo.fsmRunningStatus)) {
                return;
            }
            const callback = this._callback.bind({contractInfo, contractService: this.contractService});
            if (!contractPolicyMap.has(contractInfo.policyId)) {
                callback(new Error(`policy [id:${contractInfo.policyId}] is not found`));
                return;
            }
            this.taskQueue.push({
                contractInfo,
                policyInfo: contractPolicyMap.get(contractInfo.policyId)
            }, callback);
        });
    }

    async _initialContract(contract: { contractInfo: ContractInfo, policyInfo: PolicyInfo }) {
        const {contractInfo, policyInfo} = contract;
        if (contractInfo.authStatus !== ContractAuthStatusEnum.Unknown) {
            throw new ApplicationError('please check contract data. contract.authStatus is invalid');
        }
        // 目前初始态的状态名固定为init或initial (后续规则也可能修改为第一个)
        contractInfo.fsmCurrentState = Object.keys(policyInfo.fsmDescriptionInfo).find(x => /^(init|initial)$/i.test(x));
        this.contractFsmGenerator.contractWarpToFsm(contractInfo, policyInfo);
    }

    /**
     * 初始化错误处理
     * @param error
     * @returns {Promise<void>}
     * @private
     */
    _callback(this: any, error) {
        if (!error) {
            return;
        }
        const contractInfo = this.contractInfo as ContractInfo;
        this.contractService.updateContractInfo(contractInfo, {fsmRunningStatus: ContractFsmRunningStatusEnum.InitializedError}).finally(err => {
            console.log(`===============begin:${contractInfo.contractId}=======================`);
            console.log(`contract initial error`, error.toString());
            if (err) {
                console.log(err);
            }
            console.log(`===============end:${contractInfo.contractId}=======================`);
        });
    }
}
