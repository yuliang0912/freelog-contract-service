import {IPolicyCompiler, PolicyInfo, FsmDescriptionInfo} from '../../interface';
import {ApplicationError, SubjectTypeEnum, CryptoHelper} from 'egg-freelog-base';
import {v4} from 'uuid';

export class BasePolicyCompiler implements IPolicyCompiler {

    compiler(subjectType: SubjectTypeEnum, policyText: string): PolicyInfo {
        throw new ApplicationError('compiler not implemented');
    }

    compilerErrorHandle(error) {
        throw new ApplicationError(`policy compiler error:${error}`);
    }

    /**
     * 生成策略Id
     * @param policyText
     */
    generatePolicyId(subjectType: SubjectTypeEnum, policyText: string) {
        return CryptoHelper.md5(`$FREELOG_POLICY_TEXT_${policyText.trim()}_SUBJECT_TYPE_${subjectType}`);
        // return md5(policyText.replace(/\s{2,}/g, '') + '_subjectType:' + subjectType);
    }

    /**
     * 生成事件ID
     * @param fsmDescriptionInfo
     */
    setFsmDescriptionInfoProperty(fsmDescriptionInfo: FsmDescriptionInfo): FsmDescriptionInfo {

        for (const [_, fsmStateDescriptionInfo] of Object.entries(fsmDescriptionInfo)) {
            for (const [_, policyEventInfo] of Object.entries(fsmStateDescriptionInfo.transition)) {
                if (policyEventInfo) {
                    policyEventInfo.eventId = v4().replace(/-/g, '');
                }
            }
        }
        return fsmDescriptionInfo;
    }
}
