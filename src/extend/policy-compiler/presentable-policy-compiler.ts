import {BasePolicyCompiler} from './basePolicyCompiler';
import {IPolicyCompiler, PolicyInfo} from '../../interface';
import {SubjectTypeEnum} from 'egg-freelog-base';

const freelogPolicyCompiler = require('@freelog/resource-policy-lang');

// 展品策略编译
export class PresentablePolicyCompiler extends BasePolicyCompiler implements IPolicyCompiler {

    compiler(subjectType: SubjectTypeEnum, policyText: string): PolicyInfo {

        const {state_machine, errors} = freelogPolicyCompiler.compile(policyText);
        if (errors.length) {
            super.compilerErrorHandle(errors.map(x => x.toString()).join(','));
        }
        return {
            policyId: super.generatePolicyId(subjectType, policyText),
            policyText, subjectType,
            fsmDescriptionInfo: super.setFsmDescriptionInfoProperty(state_machine.states)
        };
    }
}
