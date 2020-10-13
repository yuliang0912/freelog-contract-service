import {IPolicyCompiler, PolicyInfo} from '../../interface';
import {md5} from 'egg-freelog-base/app/extend/helper/crypto_helper';
import {SubjectType} from '../../enum';
import {ApplicationError} from 'egg-freelog-base';

export class BasePolicyCompiler implements IPolicyCompiler {

    compiler(subjectType: SubjectType, policyText: string): PolicyInfo {
        throw new ApplicationError('compiler not implemented');
    }

    compilerErrorHandle(error) {
        throw new ApplicationError(`policy compiler error:${error}`);
    }

    /**
     * 生成策略Id
     * @param policyText
     */
    generatePolicyId(subjectType: SubjectType, policyText: string) {
        return md5(`$FREELOG_POLICY_TEXT_${policyText.trim()}_SUBJECT_TYPE_${subjectType}`);
        // return md5(policyText.replace(/\s{2,}/g, '') + '_subjectType:' + subjectType);
    }
}
