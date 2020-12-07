import * as StateMachine from 'javascript-state-machine';
import { FsmDescriptionInfo, PolicyEventInfo } from '../../interface';
export declare class ContractStateMachineBuilder {
    methods: any;
    initialState: string;
    attachData: object;
    fsmDescriptionInfo: FsmDescriptionInfo;
    isExecutedEvent: boolean;
    /**
     * 构建状态机
     */
    build(): StateMachine;
    execEvent(this: any, event: PolicyEventInfo, ...otherArgs: any[]): Promise<boolean>;
    /**
     * 设置合约描述信息
     * @param fsmDescriptionInfo
     */
    setFsmDescriptionInfo(fsmDescriptionInfo: any): this;
    /**
     * 设置附属信息
     * @param {object} data
     * @returns {this}
     */
    setAttachData(data: object): this;
    /**
     * 设置初始态
     * @param {string} initialState
     * @returns {this}
     */
    setInitialState(initialState: string): this;
    /**
     * 设置进入状态事件处理函数
     * @param {(lifeCycle) => void} handle
     * @returns {this}
     */
    setOnEnterStateEventHandle(handle: (lifeCycle: any, ...args: any[]) => void): this;
    /**
     * 设置进入流转之前的事件
     * @param {(lifeCycle, ...args) => void} handle
     * @returns {this}
     */
    setOnBeforeTransition(handle: (lifeCycle: any, ...args: any[]) => void): this;
    /**
     * 状态机描述对象转换成事件集
     * @returns {any[]}
     * @private
     */
    _fsmDescriptionInfoWarpToFsmTransitions(): any[];
}
