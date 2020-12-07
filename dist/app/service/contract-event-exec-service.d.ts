import { ContractInfo, PolicyEventInfo, PolicyInfo } from '../../interface';
export declare class ContractEventExecService {
    ctx: any;
    contractFsmGenerator: any;
    eventCodeHandlerMap: Map<string, (eventInfo: PolicyEventInfo) => Promise<any>>;
    /**
     * 详细的事件code与定义参考:https://github.com/freelogfe/freelog_event_definition/blob/master/event_def.csv
     * @param eventInfo
     */
    contractEventExec(contractInfo: ContractInfo, policyInfo: PolicyInfo, eventInfo: PolicyEventInfo): Promise<void>;
    _s210EventExec(eventInfo: PolicyEventInfo): Promise<any>;
    init(): void;
}
