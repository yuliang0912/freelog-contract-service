import {inject, provide, scope, ScopeEnum} from "midway";
import {ContractInfo, IContractTriggerEventMessage, PolicyEventInfo} from "../interface";
import {forIn, pick} from "lodash";
import {ContractFsmRunningStatusEnum, PolicyEventEnum} from "../enum";
import {KafkaClient} from "../kafka/client";
import {IMongodbOperation} from "egg-freelog-base";
import {ClientSession} from "mongoose";

@provide()
@scope(ScopeEnum.Singleton)
export class ContractFsmEventRegisterHandler {

    // 允许注册的事件
    allowRegisterEvents: string[] = [PolicyEventEnum.EndOfCycleEvent, PolicyEventEnum.AbsolutelyTimeEvent, PolicyEventEnum.RelativeTimeEvent];

    @inject()
    kafkaClient: KafkaClient;
    @inject()
    contractInfoProvider: IMongodbOperation<ContractInfo>;

    /**
     * 注册合同新状态下需要侦听的事件(注册业务同时会取消注册之前的事件)
     * @param contractInfo
     * @param session
     * @param eventInfo
     * @param fromState
     * @param toState
     */
    async registerContractEvents(contractInfo: ContractInfo, session: ClientSession, eventInfo: IContractTriggerEventMessage, fromState: string, toState: string): Promise<void> {

        const toBeRegisterEventInfos = this.getCanRegisterEvents(contractInfo, toState);
        const alreadyRegisteredEventInfos = this.getCanRegisterEvents(contractInfo, fromState);
        if (!toBeRegisterEventInfos.length && !alreadyRegisteredEventInfos.length) {
            return;
        }
        const eventBody = toBeRegisterEventInfos.map(eventInfo => {
            return adapter(pick(eventInfo, ['service', 'name', 'code', 'eventId', 'args']));
        });

        // 兼容数据结构,等待佳男修改完毕即可
        function adapter(eventInfo) {
            switch (eventInfo.code) {
                case PolicyEventEnum.EndOfCycleEvent:
                    const cycleUnit = eventInfo.args[0];
                    eventInfo.args = {cycleCount: 1, cycleUnit};
                    break;
                case  PolicyEventEnum.AbsolutelyTimeEvent:
                    const datetime = eventInfo.args[0];
                    eventInfo.args = {datetime};
                    break;
                default:
                    break;
            }
            return eventInfo;
        }

        // 分析当前状态下需要侦听的所有事件集,一次发送注册. 事件中心会先取消之前注册的事件集,然后重新注册新的事件集
        // 如果mq发送消息失败,并不影响本次合约的状态变更.而是修改合约状态,直到定时job把事件注册成功为止
        // 注册失败时,合约无法接受其他事件,直到合约注册成功为止
        try {
            await this.kafkaClient.send({
                topic: 'contract-fsm-event-register-topic',
                acks: -1,
                messages: [{
                    key: contractInfo.contractId,
                    value: JSON.stringify(eventBody),
                    headers: {contractId: contractInfo.contractId, fromState, toState}
                }]
            }).catch(error => this.errorHandle(contractInfo, session));
        } catch (error) {
            await this.errorHandle(contractInfo, session);
        }
    }

    /**
     * 获取可以注册的事件集
     * @param contractInfo
     * @param state
     */
    getCanRegisterEvents(contractInfo: ContractInfo, state: string): PolicyEventInfo[] {
        const toBeRegisterEventInfos: PolicyEventInfo[] = [];
        const fsmDescriptionInfo = contractInfo.policyInfo.fsmDescriptionInfo[state];
        if (!fsmDescriptionInfo?.transition) {
            return toBeRegisterEventInfos;
        }
        forIn(fsmDescriptionInfo.transition, (eventInfo) => {
            if (this.allowRegisterEvents.includes(eventInfo.code)) {
                toBeRegisterEventInfos.push(eventInfo);
            }
        });
        return toBeRegisterEventInfos;
    }

    /**
     * 错误处理,事件注册失败,可以通过后续的job重新尝试注册.注册成功之前,不允许合约执行其他事件
     * @param contractInfo
     * @param session
     */
    errorHandle(contractInfo: ContractInfo, session: ClientSession) {
        console.log('事件注册失败,后续job会尝试重新注册');
        return this.contractInfoProvider.updateOne({_id: contractInfo.contractId}, {
            fsmRunningStatus: ContractFsmRunningStatusEnum.ToBeRegisteredEvents
        }, {session});
    }
}
