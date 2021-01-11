import {forIn} from 'lodash';
import {provide, scope} from 'midway';
import {LogicError} from 'egg-freelog-base';
import {FsmDescriptionInfo} from '../../interface';

@scope('Singleton')
@provide('contractFsmEventAnalysis')
export class ContractFsmEventAnalysis {

    /**
     * 获取合同指定状态下的所有可注册事件
     * @param fsmDescriptionInfo
     * @param fsmCurrentState
     */
    getContractCanBeRegisteredEvents(fsmDescriptionInfo: FsmDescriptionInfo, fsmCurrentState: string) {
        const contractCanBeRegisteredEvents = [];
        const currentStateFsmDescriptionInfo = fsmDescriptionInfo[fsmCurrentState];
        if (!currentStateFsmDescriptionInfo) {
            throw new LogicError(`please check code! current contract fsm is not exist stateName:[${fsmCurrentState}]`);
        }
        forIn(currentStateFsmDescriptionInfo.transition, (eventInfo, _nextState) => {
            if (eventInfo && this.getContractCanBeRegisteredEventCodes.includes(eventInfo.code)) {
                contractCanBeRegisteredEvents.push(eventInfo);
            }
        });
        return contractCanBeRegisteredEvents;
    }

    /**
     * 获取合同状态机下的所有可注册事件的编码
     * @returns {string[]}
     */
    get getContractCanBeRegisteredEventCodes() {
        return ['A101', 'A102', 'A103'];
    }
}
