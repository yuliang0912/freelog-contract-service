import {provide, inject, init, scope} from 'midway';
import {ContractInfo, PolicyEventInfo, PolicyInfo} from '../../interface';

@scope('Singleton')
@provide('contractEventExecService')
export class ContractEventExecService {

    @inject()
    ctx;
    @inject()
    contractFsmGenerator;

    eventCodeHandlerMap = new Map<string, (eventInfo: PolicyEventInfo) => Promise<any>>();


    /**
     * 详细的事件code与定义参考:https://github.com/freelogfe/freelog_event_definition/blob/master/event_def.csv
     * @param eventInfo
     */
    async contractEventExec(contractInfo: ContractInfo, policyInfo: PolicyInfo, eventInfo: PolicyEventInfo) {
        // const contractFsmStateMachine = this.contractFsmGenerator.contractWarpToFsm(contractInfo, policyInfo);
    }

    async _s210EventExec(eventInfo: PolicyEventInfo) {
        return null;
    }

    @init()
    init() {
        this.eventCodeHandlerMap.set('S20', this._s210EventExec);
    }
}
