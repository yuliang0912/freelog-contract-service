"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractStateMachineBuilder = void 0;
const lodash_1 = require("lodash");
const StateMachine = require("javascript-state-machine");
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
const StateMachineHistory = require("javascript-state-machine/lib/history");
let ContractStateMachineBuilder = class ContractStateMachineBuilder {
    constructor() {
        this.methods = {};
        this.attachData = {};
        this.isExecutedEvent = false; // freelog系统合约特性.每次事件单独创建一个状态机.不存在连续执行两次事件的情况
    }
    /**
     * 构建状态机
     */
    build() {
        if (!this.fsmDescriptionInfo) {
            throw new egg_freelog_base_1.ApplicationError('fsmDescriptionInfo is unset');
        }
        const fsmConfig = {
            init: this.initialState,
            data: Object.assign(this.attachData, { currEvent: { eventId: this.initialState } }),
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
    async execEvent(event, ...otherArgs) {
        const { eventId } = event;
        if (this.isExecutedEvent) {
            throw new egg_freelog_base_1.ApplicationError(`无效的事件,${eventId},状态机只支持执行1次事件`);
        }
        if (!Reflect.has(this, eventId)) {
            throw new egg_freelog_base_1.ApplicationError(`无效的事件,${eventId}`);
        }
        if (this.cannot(eventId)) {
            throw new egg_freelog_base_1.ApplicationError(`合同当前状态,不能执行${event.eventId}事件`);
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
    setAttachData(data) {
        this.attachData = data;
        return this;
    }
    /**
     * 设置初始态
     * @param {string} initialState
     * @returns {this}
     */
    setInitialState(initialState) {
        if (lodash_1.isString(initialState) && initialState.length) {
            this.initialState = initialState;
        }
        else {
            this.initialState = 'none';
        }
        return this;
    }
    /**
     * 设置进入状态事件处理函数
     * @param {(lifeCycle) => void} handle
     * @returns {this}
     */
    setOnEnterStateEventHandle(handle) {
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
    setOnBeforeTransition(handle) {
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
        lodash_1.forIn(this.fsmDescriptionInfo, (stateDescription, stateName) => {
            lodash_1.forIn(stateDescription.transition, (eventInfo, nextStateName) => {
                if (eventInfo) {
                    fsmTransitions.push({ name: eventInfo.eventId, from: stateName, to: nextStateName });
                }
            });
        });
        return fsmTransitions;
    }
};
ContractStateMachineBuilder = __decorate([
    midway_1.scope('Prototype') // 每次都重新获取新实例
    ,
    midway_1.provide('contractStateMachineBuilder')
], ContractStateMachineBuilder);
exports.ContractStateMachineBuilder = ContractStateMachineBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3Qtc3RhdGUtbWFjaGluZS1idWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2V4dGVuZC9jb250cmFjdC1jb21tb24tZ2VuZXJhdG9yL2NvbnRyYWN0LXN0YXRlLW1hY2hpbmUtYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFDdkMseURBQXlEO0FBQ3pELG1DQUFzQztBQUN0Qyx1REFBa0Q7QUFDbEQsNEVBQTRFO0FBSTVFLElBQWEsMkJBQTJCLEdBQXhDLE1BQWEsMkJBQTJCO0lBQXhDO1FBRUksWUFBTyxHQUFRLEVBQUUsQ0FBQztRQUVsQixlQUFVLEdBQVcsRUFBRSxDQUFDO1FBRXhCLG9CQUFlLEdBQUcsS0FBSyxDQUFDLENBQUMsNkNBQTZDO0lBK0cxRSxDQUFDO0lBN0dHOztPQUVHO0lBQ0gsS0FBSztRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDMUIsTUFBTSxJQUFJLG1DQUFnQixDQUFDLDZCQUE2QixDQUFDLENBQUM7U0FDN0Q7UUFDRCxNQUFNLFNBQVMsR0FBRztZQUNkLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWTtZQUN2QixJQUFJLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUMsU0FBUyxFQUFFLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUMsRUFBQyxDQUFDO1lBQy9FLFdBQVcsRUFBRSxJQUFJLENBQUMsdUNBQXVDLEVBQUU7WUFDM0QsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO1lBQ3JCLE9BQU8sRUFBRTtnQkFDTCxJQUFJLG1CQUFtQixFQUFFO2FBQzVCO1NBQ0osQ0FBQztRQUNGLE1BQU0sWUFBWSxHQUFHLElBQUksWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2pELFlBQVksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FB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