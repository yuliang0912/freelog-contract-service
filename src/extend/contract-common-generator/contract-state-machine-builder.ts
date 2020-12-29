import {forIn, isString} from 'lodash';
import * as StateMachine from 'javascript-state-machine';
import {scope, provide} from 'midway';
import {ApplicationError} from 'egg-freelog-base';
import * as StateMachineHistory from 'javascript-state-machine/lib/history';
import {FsmDescriptionInfo, PolicyEventInfo} from '../../interface';

@scope('Prototype') // 每次都重新获取新实例
@provide('contractStateMachineBuilder')
export class ContractStateMachineBuilder {

    methods: any = {};
    initialState: string;
    attachData: object = {};
    fsmDescriptionInfo: FsmDescriptionInfo;
    isExecutedEvent = false; // freelog系统合约特性.每次事件单独创建一个状态机.不存在连续执行两次事件的情况

    /**
     * 构建状态机
     */
    build(): StateMachine {
        if (!this.fsmDescriptionInfo) {
            throw new ApplicationError('fsmDescriptionInfo is unset');
        }
        const fsmConfig = {
            init: this.initialState,
            data: Object.assign(this.attachData, {currEvent: {eventId: this.initialState}}),
            transitions: this._fsmDescriptionInfoWarpToFsmTransitions(),
            methods: this.methods,
            plugins: [
                new StateMachineHistory()
            ]
        };
        const stateMachine = new StateMachine(fsmConfig);
        stateMachine.execEvent = this.execEvent;
        return stateMachine;
    }

    async execEvent(this: any, event: PolicyEventInfo, ...otherArgs) {
        const eventId = event.eventId;
        if (this.isExecutedEvent) {
            throw new ApplicationError(`无效的事件,${eventId},状态机只支持执行1次事件,请重新同步最新数据初始化`);
        }
        if (!Reflect.has(this, eventId)) {
            throw new ApplicationError(`无效的事件,${eventId}`);
        }
        if (this.cannot(eventId)) {
            throw new ApplicationError(`合同当前状态,不能执行${event.eventId}事件`);
        }
        this.isExecutedEvent = true;
        this.currEvent = event;
        this[eventId].call(this, ...otherArgs);
        return true;
    }

    /**
     * 设置合约描述信息
     * @param fsmDescriptionInfo
     */
    setFsmDescriptionInfo(fsmDescriptionInfo) {
        this.fsmDescriptionInfo = fsmDescriptionInfo;
        return this;
    }

    /**
     * 设置附属信息
     * @param {object} data
     * @returns {this}
     */
    setAttachData(data: object) {
        this.attachData = data;
        return this;
    }

    /**
     * 设置初始态
     * @param {string} initialState
     * @returns {this}
     */
    setInitialState(initialState: string) {
        if (isString(initialState) && initialState.length) {
            this.initialState = initialState;
        } else {
            this.initialState = 'none';
        }
        return this;
    }

    /**
     * 设置进入状态事件处理函数
     * @param {(lifeCycle) => void} handle
     * @returns {this}
     */
    setOnEnterStateEventHandle(handle: (lifeCycle, ...args) => void) {
        this.methods.onEnterState = function (lifeCycle, ...args) {
            return handle.call(this, lifeCycle, ...args);
        };
        return this;
    }

    /**
     * 设置进入流转之前的事件
     * @param {(lifeCycle, ...args) => void} handle
     * @returns {this}
     */
    setOnBeforeTransition(handle: (lifeCycle, ...args) => void) {
        this.methods.onBeforeTransition = handle;
        return this;
    }

    /**
     * 状态机描述对象转换成事件集
     * @returns {any[]}
     * @private
     */
    _fsmDescriptionInfoWarpToFsmTransitions() {
        const fsmTransitions = [];
        forIn(this.fsmDescriptionInfo, (stateDescription, stateName) => {
            forIn(stateDescription.transition, (eventInfo, nextStateName) => {
                if (eventInfo) {
                    if (!eventInfo.eventId) {
                        throw new Error('策略对象存在异常,不存在事件ID');
                    }
                    fsmTransitions.push({name: eventInfo.eventId, from: stateName, to: nextStateName});
                }
            });
        });
        return fsmTransitions;
    }
}
