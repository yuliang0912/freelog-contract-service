import {IContractService} from '../../interface';
import {controller, inject, post, provide, priority} from 'midway';
import {ContractEventExecService} from '../service/contract-event-exec-service';
import {IdentityTypeEnum, visitorIdentityValidator, ApplicationError, FreelogContext} from 'egg-freelog-base';
import {PolicyEventEnum} from '../../enum';

@provide()
@priority(1)
@controller('/v2/contracts')
export class ContractEventController {

    @inject()
    ctx: FreelogContext;
    @inject()
    contractService: IContractService;
    @inject()
    contractEventExecService: ContractEventExecService;

    /**
     * 支付事件
     */
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    @post('/:contractId/payment')
    async payment() {

        const {ctx} = this;
        const contractId = ctx.checkParams('contractId').isContractId().value;
        const eventId = ctx.checkBody('eventId').exist().isMd5().value;
        const accountId = ctx.checkBody('accountId').exist().type('string').value;
        const password = ctx.checkBody('password').exist().type('string').len(6, 6).value;
        const transactionAmount = ctx.checkBody('transactionAmount').exist().toFloat().value;
        ctx.validateParams();

        const contractInfo = await this.contractService.findById(contractId);
        if (!contractInfo) {
            throw new ApplicationError(ctx.gettext('contract-entity-not-found'));
        }

        await this.contractEventExecService.execContractEvent(contractInfo, PolicyEventEnum.TransactionEvent, eventId, accountId, transactionAmount, password).then(ctx.success);
    }
}
