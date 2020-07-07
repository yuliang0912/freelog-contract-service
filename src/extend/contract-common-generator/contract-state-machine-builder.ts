import {forIn} from 'lodash';
import * as StateMachine from 'javascript-state-machine';
import {scope, provide} from 'midway';
import {ApplicationError} from 'egg-freelog-base';
import * as StateMachineHistory from 'javascript-state-machine/lib/history';

@scope('Prototype')
@provide('contractStateMachineBuilder')
export class ContractStateMachineBuilder {

    methods: any = {};
    initialState: string;
    attachData: object = {};
    fsmDescriptionInfo;

    /**
     * 构建状态机
     */
    build(): StateMachine {
        if (!this.fsmDescriptionInfo) {
            throw new ApplicationError('fsmDescriptionInfo is unset');
        }
        const fmsConfig = {
            init: this.initialState,
            data: Object.assign(this.attachData, {currEvent: {eventId: this.initialState}}),
            transitions: this._fsmDescriptionInfoWarpToFsmTransitions(),
            methods: this.methods,
            plugins: [
                new StateMachineHistory()
            ]
        };
        const stateMachine = new StateMachine(fmsConfig);
        stateMachine.execEvent = this.execEvent;
        return stateMachine;
    }

    async execEvent(this: any, event, ...otherArgs) {
        const {eventId} = event;
        if (!Reflect.has(this, eventId)) {
            throw new ApplicationError(`无效的事件,${eventId}`);
        }
        if (this.cannot(eventId)) {
            throw new ApplicationError(`合同当前状态,不能执行${event.eventId}事件`);
        }
        this.currEvent = event;
        this.eventId.call(null, ...otherArgs);
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
        this.initialState = initialState;
        return this;
    }

    /**
     * 设置进入状态事件处理函数
     * @param {(lifeCycle) => void} handle
     * @returns {this}
     */
    setOnEnterStateEventHandle(handle: (lifeCycle, ...args) => void) {
        this.methods.onEnterState = function (lifeCycle, ...args) {
            handle.call(this, lifeCycle, ...args);
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
                    fsmTransitions.push({name: eventInfo.eventId, from: stateName, to: nextStateName});
                }
            });
        });
        return fsmTransitions;
    }
}
