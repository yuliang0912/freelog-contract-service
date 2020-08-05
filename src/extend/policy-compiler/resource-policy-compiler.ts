import {BasePolicyCompiler} from './basePolicyCompiler';
import {IPolicyCompiler, PolicyInfo} from '../../interface';
import {SubjectType} from '../../enum';

const freelogPolicyCompiler = require('@freelog/resource-policy-lang');

export class ResourcePolicyCompiler extends BasePolicyCompiler implements IPolicyCompiler {

    compiler(userId: number, subjectType: SubjectType, policyText: string, policyName: string): PolicyInfo {

        const {state_machine, errors} = freelogPolicyCompiler.compile(policyText);
        if (errors.length) {
            super.compilerErrorHandle(errors.map(x => x.toString()).join(','));
        }

        return {
            policyId: super.generatePolicyId(userId, subjectType, policyText),
            policyText, policyName, subjectType,
            fsmDescriptionInfo: state_machine.states
        };
    }
}
