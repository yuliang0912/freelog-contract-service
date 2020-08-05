import { ContractInfo, IEventHandler } from '../../interface';
export declare class SetAuthStatusEventHandler implements IEventHandler {
    private _queue;
    readonly MAX_QUEUE_TASK_COUNT = 50;
    handle(contractInfos: ContractInfo[]): Promise<void>;
    get taskQueue(): any;
    _setAuthStatusEventHandle(contractInfo: ContractInfo): Promise<void>;
    _callback(): Promise<void>;
}
