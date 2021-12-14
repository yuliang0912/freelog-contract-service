import {v4} from 'uuid';
import {config, provide, scope} from 'midway';
import {compile} from '@freelog/resource-policy-lang';
import {FsmDescriptionInfo, IPolicyCompiler, PolicyInfo} from '../../interface';
import {CryptoHelper, SubjectTypeEnum, ContractColorStateTypeEnum} from 'egg-freelog-base';
import {isEmpty} from 'lodash';

@provide()
@scope('Singleton')
export class PolicyCompiler implements IPolicyCompiler {

    @config()
    gatewayUrl: string;
    @config()
    env: string;

    /**
     * 根据标的物类型编译策略文本
     * @param subjectType
     * @param policyText
     */
    async compiler(subjectType: SubjectTypeEnum, policyText: string): Promise<PolicyInfo> {

        let targetUrl = this.gatewayUrl;
        if (this.env === 'local') {
            targetUrl = 'http://api.testfreelog.com';
        }
        const {state_machine} = await compile(policyText, SubjectTypeEnum[subjectType].toLocaleLowerCase(), targetUrl, 'dev');
        const fsmDescriptionInfo: FsmDescriptionInfo = state_machine.states;
        const serviceStateMap = new Map((state_machine.declarations.serviceStates as any[]).map(x => [x.name, x.type.toLowerCase()]));

        for (const fsmStateDescriptionInfo of Object.values(fsmDescriptionInfo)) {
            fsmStateDescriptionInfo.isAuth = fsmStateDescriptionInfo.serviceStates.some(x => serviceStateMap.get(x) === ContractColorStateTypeEnum[ContractColorStateTypeEnum.Authorization].toLowerCase());
            fsmStateDescriptionInfo.isTestAuth = fsmStateDescriptionInfo.serviceStates.some(x => serviceStateMap.get(x) === ContractColorStateTypeEnum[ContractColorStateTypeEnum.TestAuthorization].toLowerCase());
            if (isEmpty(fsmStateDescriptionInfo.transitions) || fsmStateDescriptionInfo.transitions.some(x => x.name === 'terminate')) {
                fsmStateDescriptionInfo.isTerminate = true;
                continue;
            }
            for (const eventInfo of fsmStateDescriptionInfo.transitions) {
                eventInfo.eventId = v4().replace(/-/g, '');
                Reflect.deleteProperty(eventInfo, 'description');
            }
        }

        let fsmDeclarationInfo = Object.assign({}, state_machine.declarations || {}, state_machine.description || {});
        fsmDeclarationInfo.audiences = state_machine.audiences || [];
        return {
            policyId: this.generatePolicyId(subjectType, policyText),
            subjectType, policyText, fsmDeclarationInfo, fsmDescriptionInfo
        };
    }

    /**
     * 生成策略ID
     * @param subjectType
     * @param policyText
     */
    generatePolicyId(subjectType: SubjectTypeEnum, policyText: string) {
        return CryptoHelper.md5(`FREELOG_POLICY_TEXT_${policyText.trim()}_SUBJECT_TYPE_${subjectType}`);
    }
}
