import {inject, provide} from 'midway';
import {ContractInfo, IContractStateMachine, PolicyEventInfo} from '../../interface';
import {PolicyEventEnum} from '../../enum';
import {PolicyService} from './policy-service';
import {ApplicationError, AuthorizationError} from 'egg-freelog-base';
import {OutsideApiService} from './outside-api-service';
import Decimal from 'decimal.js-light';
import {ContractEnvironmentVariableHandler} from '../../extend/contract-environment-variable-handler';

// 只执行需要人为触发的事件
@provide()
export class ContractEventExecService {

    @inject()
    ctx;
    @inject()
    policyService: PolicyService;
    @inject()
    outsideApiService: OutsideApiService;
    @inject()
    buildContractStateMachine: (contractInfo: ContractInfo) => IContractStateMachine;
    @inject()
    contractEnvironmentVariableHandler: ContractEnvironmentVariableHandler;

    private eventCodeHandlerMap = new Map<string, (contractFsm: IContractStateMachine, eventInfo: PolicyEventInfo, ...args) => Promise<any>>();

    constructor() {
        this.eventCodeHandlerMap.set(PolicyEventEnum.TransactionEvent, this.transactionEventHandle.bind(this));
    }

    /**
     * 执行合约事件
     * @param contractInfo
     * @param eventType
     * @param eventId
     * @param args
     */
    async execContractEvent(contractInfo: ContractInfo, eventType: PolicyEventEnum, eventId: string, ...args) {
        if (!this.contractExecutePermissionCheck(contractInfo, eventType)) {
            throw new AuthorizationError(this.ctx.gettext('user-authorization-failed'));
        }
        if (!contractInfo.policyInfo) {
            contractInfo.policyInfo = await this.policyService.findOne({policyId: contractInfo.policyId});
        }
        const contractFsm = this.buildContractStateMachine(contractInfo);
        if (!contractFsm.isCanExecEvent(eventId)) {
            throw new ApplicationError('当前合约不能执行该事件');
        }
        const eventInfo = contractFsm.getEventInfo(eventId);
        if (!this.eventCodeHandlerMap.has(eventInfo.code)) {
            throw new ApplicationError('不支持的事件');
        }
        if (eventInfo.code !== eventType) {
            throw new ApplicationError('实际事件与预设的事件类型不匹配');
        }
        return Reflect.apply(this.eventCodeHandlerMap.get(eventInfo.code), this, [contractFsm, eventInfo, ...args]);
    }

    /**
     * 交易事件触发(发送交易请求到支付服务..后续的处理由支付何物和合约服务自动对接)
     * @param contractFsm
     * @param eventInfo
     * @param accountId
     * @param transactionAmount
     * @param password
     * @private
     */
    private async transactionEventHandle(contractFsm: IContractStateMachine, eventInfo: PolicyEventInfo, accountId: string, transactionAmount: number, password: string) {
        const {args, eventId} = eventInfo;
        // 交易金额二次传递确认是为了保证前端显示的交易金额与后端的计算金额一致,防止出现技术失误
        if (!new Decimal(args.amount).eq(transactionAmount)) {
            throw new ApplicationError('交易金额与合约约定的金额不符合');
        }
        const contractInfo = contractFsm.contractInfo;
        let reciprocalAccountId = args.account;
        if (this.contractEnvironmentVariableHandler.isIncludesStaticEnvironmentVariable(reciprocalAccountId)) {
            const envArgInfo = await this.contractEnvironmentVariableHandler.getEnvironmentVariable(contractInfo, reciprocalAccountId);
            reciprocalAccountId = envArgInfo?.accountId; // 合约初始化成功,则一定存在账户ID属性.
        }
        return this.outsideApiService.contractPayment(accountId, reciprocalAccountId, transactionAmount, contractInfo.contractId, contractInfo.contractName, eventId, password);
    }

    /**
     * 合约执行权限校验
     * @param contractInfo
     * @param eventType
     * @private
     */
    private contractExecutePermissionCheck(contractInfo: ContractInfo, eventType: PolicyEventEnum) {
        const isLicensee = contractInfo?.licenseeOwnerId === this.ctx.userId;
        //const isLicensor = contractInfo?.licensorOwnerId === this.ctx.userId;
        // 目前只支持乙方触发交易事件.后续动态调整,比如甲方没收保证金
        return isLicensee && [PolicyEventEnum.TransactionEvent].includes(eventType);
    }
}
