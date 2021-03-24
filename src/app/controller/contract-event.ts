import {controller, inject, post, provide, priority} from 'midway';
import {ContractInfo, IContractService, IContractStateMachine, IPolicyService, PolicyEventInfo} from '../../interface';
import {
    IdentityTypeEnum, visitorIdentityValidator, ArgumentError,
    ApplicationError, AuthorizationError, FreelogContext
} from 'egg-freelog-base';
import {KafkaClient} from '../../kafka/client';

@provide()
@priority(1)
@controller('/v2/contracts')
export class ContractEventController {

    @inject()
    ctx: FreelogContext;
    @inject()
    policyService: IPolicyService;
    @inject()
    contractService: IContractService;
    @inject()
    kafkaClient: KafkaClient;
    @inject()
    buildContractStateMachine: (contractInfo: ContractInfo) => IContractStateMachine;

    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    @post('/:contractId/execEvent')
    async execContractEvent() {

        const {ctx} = this;
        const contractId = ctx.checkParams('contractId').isContractId().value;
        const eventId = ctx.checkBody('eventId').exist().isMd5().value;
        ctx.validateParams();

        const contractInfo = await this.contractService.findById(contractId);
        if (!contractInfo) {
            throw new ApplicationError(ctx.gettext('contract-entity-not-found'));
        }
        if (contractInfo.licenseeOwnerId !== ctx.userId || contractInfo.licensorOwnerId !== ctx.userId) {
            throw new AuthorizationError(ctx.gettext('user-authorization-failed'));
        }

        const policyInfo = await this.policyService.findOne({policyId: contractInfo.policyId});
        const currentStateFsmDeclaration = policyInfo.fsmDescriptionInfo[contractInfo.fsmCurrentState];

        let currentEventInfo: PolicyEventInfo;
        for (const [_, policyEventInfo] of Object.entries(currentStateFsmDeclaration.transition)) {
            if (policyEventInfo?.eventId === eventId) {
                currentEventInfo = policyEventInfo;
                break;
            }
        }
        if (!currentEventInfo) {
            throw new ArgumentError(ctx.gettext('params-validate-failed', 'eventId'));
        }

        // 根据合同当前的状态描述,然后找出对应的事件信息,然后根据事件类型去做不同的参数校验以及细分的执行权限校验
        ctx.success({currentEventInfo, eventId});
    }

    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    @post('/:contractId/execTestEvent')
    async execContractEventTest() {

        const {ctx} = this;
        const contractId = ctx.checkParams('contractId').isContractId().value;
        // const eventId = ctx.checkBody('eventId').exist().value;
        ctx.validateParams();

        const contractInfo = await this.contractService.findById(contractId);
        if (!contractInfo) {
            throw new ApplicationError(ctx.gettext('contract-entity-not-found'));
        }
        contractInfo.policyInfo = await this.policyService.findOne({policyId: contractInfo.policyId});
        const fsm = this.buildContractStateMachine(contractInfo);
        console.log(fsm['mongoose']);
    }
}
