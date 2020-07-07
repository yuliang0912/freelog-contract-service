import {provide} from 'midway';
import {ContractPolicyInfo} from '../../interface';

@provide('contractPolicyCompiler')
export class ContractPolicyCompiler {

    /**
     * 编译策略文本
     * @param policyText
     * @param policyName
     * @returns {ContractPolicyInfo}
     */
    compilePolicyText(policyText, policyName): ContractPolicyInfo {
        return {
            policyName,
            policyId: '8cefe2f1dcc6dd0bdaadac946cb63dbc',
            policyText: 'for public:\n  initial:\n    active\n   presentable\n    terminate',
            fsmDescriptionInfo: {
                initial: {
                    authorization: [
                        'active', 'presentable'
                    ],
                    transition: {
                        terminate: null
                    }
                }
            }
        };
    }
}
