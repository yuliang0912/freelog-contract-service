import {controller, inject, get, post, provide} from 'midway';
import {IContractService} from '../../interface';
import {visitorIdentity} from '../../extend/vistorIdentityDecorator';
import {LoginUser, InternalClient, LoginUserAndInternalClient, ArgumentError} from 'egg-freelog-base';

@provide()
@controller('/v1/contracts')
export class ContractController {

    @inject()
    contractService: IContractService;

    @get('/list')
    @visitorIdentity(LoginUser)
    async list(ctx) {
        const contractIds = ctx.checkQuery('contractIds').optional().isSplitMongoObjectId().toSplitArray().len(1, 200).value;
        ctx.validateParams();
        ctx.success(contractIds);
    }

    @post('/resourceContracts/batchSign')
    @visitorIdentity(LoginUserAndInternalClient)
    async batchCreateResourceContracts(ctx) {
        throw new ArgumentError();
    }

    @post('/')
    @visitorIdentity(LoginUser)
    async create(ctx) {
        throw new ArgumentError();
    }

    @get('/:contractId')
    @visitorIdentity(LoginUser | InternalClient)
    async show(ctx) {
        const contractId = ctx.checkParams('contractId').notEmpty().isContractId().value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        await this.contractService.findById(contractId, projection.join(' ')).then(ctx.success);
    }
}
