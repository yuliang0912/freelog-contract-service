import {v4} from 'uuid';
import {capitalize} from 'lodash';
import {config, provide, scope} from 'midway';
import {compile} from '@freelog/resource-policy-lang';
import {IPolicyCompiler, PolicyInfo} from '../../interface';
import {CryptoHelper, SubjectTypeEnum, ContractColorStateTypeEnum} from 'egg-freelog-base';

@provide()
@scope('Singleton')
export class PolicyCompiler implements IPolicyCompiler {

    @config()
    gatewayUrl: string;

    /**
     * 根据标的物类型编译策略文本
     * @param subjectType
     * @param policyText
     */
    async compiler(subjectType: SubjectTypeEnum, policyText: string): Promise<PolicyInfo> {

        const {state_machine} = await compile(policyText, SubjectTypeEnum[subjectType].toLocaleLowerCase(), 'http://api.testfreelog.com', 'dev');
        const serviceStateMap = new Map((state_machine.declarations.serviceStates as any[]).map(x => [x.name, capitalize(x.type)]));
        for (const [_, fsmStateDescriptionInfo] of Object.entries(state_machine.states)) {
            fsmStateDescriptionInfo['isAuth'] = fsmStateDescriptionInfo['serviceStates'].some(x => serviceStateMap.get(x) === ContractColorStateTypeEnum[ContractColorStateTypeEnum.Authorization]);
            fsmStateDescriptionInfo['isTestAuth'] = fsmStateDescriptionInfo['serviceStates'].some(x => serviceStateMap.get(x) === ContractColorStateTypeEnum[ContractColorStateTypeEnum.TestAuthorization]);
            if (!fsmStateDescriptionInfo['transition']) {
                fsmStateDescriptionInfo['isTerminate'] = true;
                continue;
            }
            for (const [_, policyEventInfo] of Object.entries(fsmStateDescriptionInfo['transition'])) {
                policyEventInfo['eventId'] = v4().replace(/-/g, '');
                delete policyEventInfo['description'];
                delete policyEventInfo['singleton'];
            }
        }

        return {
            policyId: this.generatePolicyId(subjectType, policyText),
            subjectType, policyText,
            fsmDeclarationInfo: state_machine.declarations,
            fsmDescriptionInfo: state_machine.states,
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
