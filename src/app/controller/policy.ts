import {controller, get, provide} from 'midway';
import {visitorIdentity} from '../../extend/vistorIdentityDecorator';
import {LoginUser} from 'egg-freelog-base';

@provide()
@controller('/v1/policies')
export class PolicyController {

    @get('/list')
    @visitorIdentity(LoginUser)
    async list(ctx) {
        const contractIds = ctx.checkQuery('policyIds').optional().isSplitMongoObjectId().toSplitArray().len(1, 200).value;
        ctx.validateParams();
        ctx.success(contractIds);
    }
}
