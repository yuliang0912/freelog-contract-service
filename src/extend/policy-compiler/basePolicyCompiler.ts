import {IPolicyCompiler, PolicyInfo} from '../../interface';
import {md5} from 'egg-freelog-base/app/extend/helper/crypto_helper';
import {SubjectType} from '../../enum';
import {ApplicationError} from 'egg-freelog-base';

export class BasePolicyCompiler implements IPolicyCompiler {

    compiler(userId: number, subjectType: SubjectType, policyText: string, policyName: string): PolicyInfo {
        throw new ApplicationError('compiler not implemented');
    }

    compilerErrorHandle(error) {
        throw new ApplicationError(`policy compiler error:${error}`);
    }

    /**
     * 生成策略Id
     * @param policyText
     */
    generatePolicyId(userId: number, subjectType: SubjectType, policyText: string) {
        return md5(policyText.replace(/\s{2,}/g, '') + '_userId:' + userId + '_subjectType:' + subjectType);
    }
}
