import {init, provide, scope} from 'midway';
import {IPolicyCompiler, PolicyInfo} from '../../interface';
import {ResourcePolicyCompiler} from './resource-policy-compiler';
import {PresentablePolicyCompiler} from './presentable-policy-compiler';
import {ApplicationError, SubjectTypeEnum} from 'egg-freelog-base';

@provide()
@scope('Singleton')
export class PolicyCompiler implements IPolicyCompiler {

    readonly subjectPolicyCompilerMap = new Map<SubjectTypeEnum, IPolicyCompiler>();

    /**
     * 根据标的物类型编译策略文本
     * @param subjectType
     * @param policyText
     * @param policyName
     */
    compiler(subjectType: SubjectTypeEnum, policyText: string): PolicyInfo {
        if (!this.subjectPolicyCompilerMap.has(subjectType)) {
            throw new ApplicationError(`unsupported subjectType:${subjectType}`);
        }
        return this.subjectPolicyCompilerMap.get(subjectType).compiler(subjectType, policyText);
    }

    @init()
    initialSubjectPolicyCompiler() {
        this.subjectPolicyCompilerMap.set(SubjectTypeEnum.Resource, new ResourcePolicyCompiler());
        this.subjectPolicyCompilerMap.set(SubjectTypeEnum.Presentable, new PresentablePolicyCompiler());
    }
}
