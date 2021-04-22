import {provide, inject} from 'midway';
import {ContractInfo, IContractStateMachine, PolicyEventInfo} from '../../interface';
import {PolicyEventEnum} from '../../enum';
import {PolicyService} from './policy-service';
import {ApplicationError, AuthorizationError} from 'egg-freelog-base';
import {OutsideApiService} from './outside-api-service';
import Decimal from 'decimal.js-light';

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
        if (contractInfo?.licenseeOwnerId !== this.ctx.userId || contractInfo?.licensorOwnerId !== this.ctx.userId) {
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
        // return this.eventCodeHandlerMap.get(eventInfo.code)(contractFsm, eventInfo, ...args);
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
    private transactionEventHandle(contractFsm: IContractStateMachine, eventInfo: PolicyEventInfo, accountId: string, transactionAmount: number, password: string) {
        const {args, eventId} = eventInfo;
        // 交易金额二次传递确认是为了保证前端显示的交易金额与后端的计算金额一致,防止出现技术失误
        if (!new Decimal(args.amount).eq(transactionAmount)) {
            throw new ApplicationError('交易金额与合约约定的金额不符合');
        }
        const contractInfo = contractFsm.contractInfo;
        return this.outsideApiService.contractPayment(accountId, args.account, transactionAmount, contractInfo.contractId, contractInfo.contractName, eventId, password);
    }
}
