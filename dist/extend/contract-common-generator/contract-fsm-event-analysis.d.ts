export declare class ContractFsmEventAnalysis {
    /**
     * 获取合同指定状态下的所有可注册事件
     * @param {ContractPolicyInfo} contractPolicyInfo
     * @param {string} fsmCurrentState
     * @returns {any[]}
     */
    getContractCanBeRegisteredEvents(fsmDescriptionInfo: object, fsmCurrentState: string): any[];
    /**
     * 获取合同状态机下的所有可注册事件的编码
     * @returns {string[]}
     */
    get getContractCanBeRegisteredEventCodes(): string[];
}
