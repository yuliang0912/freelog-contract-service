import {SubjectType} from '../../enum';
import {init, provide, scope} from 'midway';
import {IPolicyCompiler, PolicyInfo} from '../../interface';
import {ResourcePolicyCompiler} from './resource-policy-compiler';
import {ApplicationError} from 'egg-freelog-base';

@scope('Singleton')
@provide('policyCompiler')
export class PolicyCompiler implements IPolicyCompiler {

    readonly subjectPolicyCompilerMap = new Map<SubjectType, IPolicyCompiler>();

    /**
     * 根据标的物类型编译策略文本
     * @param subjectType
     * @param policyText
     * @param policyName
     */
    compiler(userId: number, subjectType: SubjectType, policyText: string, policyName: string): PolicyInfo {
        if (!this.subjectPolicyCompilerMap.has(subjectType)) {
            throw new ApplicationError(`unsupported subjectType:${subjectType}`);
        }
        return this.subjectPolicyCompilerMap.get(subjectType).compiler(userId, subjectType, policyText, policyName);
    }

    @init()
    initialSubjectPolicyCompiler() {
        this.subjectPolicyCompilerMap.set(SubjectType.Resource, new ResourcePolicyCompiler());
    }
}
