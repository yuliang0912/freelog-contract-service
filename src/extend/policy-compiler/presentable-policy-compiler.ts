import {BasePolicyCompiler} from './basePolicyCompiler';
import {IPolicyCompiler, PolicyInfo} from '../../interface';
import {SubjectType} from '../../enum';

const freelogPolicyCompiler = require('@freelog/resource-policy-lang');

export class PresentablePolicyCompiler extends BasePolicyCompiler implements IPolicyCompiler {

    compiler(subjectType: SubjectType, policyText: string): PolicyInfo {

        const {state_machine, errors} = freelogPolicyCompiler.compile(policyText);
        if (errors.length) {
            super.compilerErrorHandle(errors.map(x => x.toString()).join(','));
        }
        return {
            policyId: super.generatePolicyId(subjectType, policyText),
            policyText, subjectType,
            fsmDescriptionInfo: state_machine.states
        };
    }
}
