import * as queue from 'async/queue';
import {provide, scope} from 'midway';
import {ContractInfo, IEventHandler} from '../../interface';
import {ContractAuthStatusEnum} from '../../enum';

@scope('Singleton')
@provide('setAuthStatusEventHandler')
export class SetAuthStatusEventHandler implements IEventHandler {

    private _queue;
    readonly MAX_QUEUE_TASK_COUNT = 50;

    async handle(contractInfos: ContractInfo[]) {
        contractInfos.forEach(contractInfo => {
            if (contractInfo.authStatus !== ContractAuthStatusEnum.Unknown) {
                return;
            }
            this.taskQueue.push(contractInfo, this._callback.bind(contractInfo));
        });
    }

    get taskQueue() {
        if (!this._queue) {
            this._queue = queue(this._setAuthStatusEventHandle.bind(this), this.MAX_QUEUE_TASK_COUNT);
        }
        return this._queue;
    }

    async _setAuthStatusEventHandle(contractInfo: ContractInfo) {
        throw new Error('授权结果实际取决于标的物服务自身.需要等标的物服务先实现授权API');
    }

    async _callback() {

    }
}
