import {isString, pick, chain, first, isArray, isEmpty, assign, isNumber} from 'lodash';
import {provide, inject, plugin} from 'midway';
import {
    ContractInfo,
    BeSignSubjectOptions,
    IContractService,
    IOutsideApiService,
    IPolicyService,
    PolicyInfo,
    SubjectBaseInfo, IContractStateMachine
} from '../../interface';
import {ContractAuthStatusEnum, ContractFsmRunningStatusEnum} from '../../enum';
import {
    FreelogContext, ContractStatusEnum, ContractLicenseeIdentityTypeEnum, SubjectTypeEnum,
    PageResult, ArgumentError, ApplicationError, LogicError, IMongodbOperation
} from 'egg-freelog-base';

@provide('contractService')
export class ContractService implements IContractService {

    @plugin()
    mongoose;
    @inject()
    ctx: FreelogContext;
    @inject()
    contractInfoProvider: IMongodbOperation<ContractInfo>;
    @inject()
    policyService: IPolicyService;
    @inject()
    contractChangedHistoryProvider: IMongodbOperation<any>;
    @inject()
    contractInfoSignatureProvider;
    @inject()
    outsideApiService: IOutsideApiService;
    @inject()
    buildContractStateMachine: (contractInfo: ContractInfo) => IContractStateMachine;

    /**
     * 批量签约标的物
     * @param subjects
     * @param licenseeId
     * @param licenseeIdentityType
     * @param subjectType
     */
    async batchSignSubjects(subjects: BeSignSubjectOptions[], licenseeId: string | number, licenseeIdentityType: ContractLicenseeIdentityTypeEnum, subjectType: SubjectTypeEnum): Promise<ContractInfo[]> {

        // console.log('参数传递待签约标的物数量:' + subjects.map(x => x.policyId).toString());

        const reSignCheckResults = await this._checkIsCanReSignContracts(subjects.map(subject => Object({
            subjectType, licenseeId,
            subjectId: subject.subjectId,
            policyId: subject.policyId,
            status: ContractStatusEnum.Executed
        })));

        const beSignSubjects = reSignCheckResults.filter(x => x.isCanReSign);
        // console.log('系统检测需要真实签约的标的物:' + beSignSubjects.map(x => x.policyId).toString());
        // 已经签约并且生效中的合约不允许重签(生效中:未终止的或者系统判定异常的)
        const hasSignedAndEfficientContracts = reSignCheckResults.filter(x => !x.isCanReSign).map(x => x.signedContractInfo);
        // console.log('系统检测已存在合约的标的物策略:' + hasSignedAndEfficientContracts.map(x => x.policyId).toString());
        if (isEmpty(beSignSubjects)) {
            return hasSignedAndEfficientContracts;
        }

        const {licenseeName, licenseeOwnerId, licenseeOwnerName} = await this.outsideApiService.getLicenseeInfo(licenseeId, licenseeIdentityType);
        const beSignSubjectMap: Map<string, SubjectBaseInfo> = await this.outsideApiService.getSubjectInfos(beSignSubjects.map(x => x.subjectId), subjectType).then(list => {
            return new Map(list.map(x => [x.subjectId, x]));
        });

        const beSignSubjectPolicyMap: Map<string, PolicyInfo> = await this.policyService.findByIds(beSignSubjects.map(x => x.policyId)).then(list => new Map(list.map(x => [x.policyId, x])));
        const invalidPolicyIds = [];
        const beSignContracts = beSignSubjects.map(beSignSubject => {
            const subjectInfo = beSignSubjectMap.get(beSignSubject.subjectId);
            const {licensorId, licensorName, licensorOwnerId, policies, licensorOwnerName, subjectId, subjectName, subjectType} = subjectInfo;
            const subjectPolicyInfo = policies.find(x => x.policyId === beSignSubject.policyId);
            if (!subjectPolicyInfo || subjectPolicyInfo.status !== 1 || !beSignSubjectPolicyMap.has(beSignSubject.policyId)) {
                invalidPolicyIds.push({subjectId: beSignSubject.subjectId, policyId: beSignSubject.policyId});
                return;
            }
            const contract: ContractInfo = {
                licensorId, licensorName, licensorOwnerId, licensorOwnerName,
                licenseeId, licenseeName, licenseeOwnerId, licenseeOwnerName, licenseeIdentityType,
                subjectId, subjectName, subjectType,
                contractId: this.mongoose.getNewObjectId(),
                contractName: subjectPolicyInfo.policyName,
                policyId: subjectPolicyInfo.policyId,
                fsmCurrentState: '',
                authStatus: ContractAuthStatusEnum.Unauthorized,
                status: ContractStatusEnum.Executed,
                fsmRunningStatus: ContractFsmRunningStatusEnum.Uninitialized,
                createDate: new Date()
            };
            contract.signature = this.contractInfoSignatureProvider.contractBaseInfoSignature(contract);
            contract.uniqueKey = this.contractInfoSignatureProvider.contractBaseInfoUniqueKeyGenerate(contract);
            return contract;
        });

        if (!isEmpty(invalidPolicyIds)) {
            throw new ApplicationError(this.ctx.gettext('subject-policy-check-failed'), invalidPolicyIds);
        }

        const latestSignedContracts = await this.contractInfoProvider.insertMany(beSignContracts);

        this._initialContracts(latestSignedContracts, beSignSubjectPolicyMap).catch();

        return [...latestSignedContracts, ...hasSignedAndEfficientContracts];
    }

    /**
     * 更新合同基础信息
     * @param {ContractInfo} contract
     * @param {UpdateContractBaseInfoOptions} options
     * @returns {Promise<boolean>}
     */
    async updateContractInfo(contract: ContractInfo, options: any): Promise<boolean> {
        const model: any = {};
        if (isString(options.contractName)) {
            model.contractName = options.contractName;
        }
        if (isNumber(options.sortId)) {
            model.sortId = options.sortId;
        }
        if (isNumber(options.authStatus)) {
            model.authStatus = options.authStatus;
        }
        if (isNumber(options.status)) {
            model.authStatus = options.status;
        }
        if (isNumber(options.fsmRunningStatus)) {
            model.fsmRunningStatus = options.fsmRunningStatus;
        }
        if (isString(options.fsmCurrentState) && options.fsmCurrentState.length) {
            model.fsmCurrentState = options.fsmCurrentState;
        }
        if (!Object.keys(model).length) {
            throw new ArgumentError('params is invalid');
        }
        return this.contractInfoProvider.updateOne({_id: contract.contractId}, model).then(data => Boolean(data.ok));
    }

    /**
     * 设置默认执行合同
     * @param {ContractInfo} contract
     * @returns {Promise<boolean>}
     */
    async setDefaultExecContract(contract: ContractInfo): Promise<boolean> {

        if (contract.licenseeIdentityType !== ContractLicenseeIdentityTypeEnum.ClientUser) {
            throw new LogicError('please check contractType');
        }

        await this.contractInfoProvider.updateMany(pick(contract, ['subjectId', 'subjectType', 'licenseeId']), {sortId: 0});

        return this.contractInfoProvider.updateOne({_id: contract.contractId}, {sortId: 1}).then(data => Boolean(data.ok));
    }

    async findOne(condition: object, ...args): Promise<ContractInfo> {
        return this.contractInfoProvider.findOne(condition, ...args);
    }

    async findById(contractId: string, ...args): Promise<ContractInfo> {
        return this.contractInfoProvider.findById(contractId, ...args);
    }

    async find(condition: object, ...args): Promise<ContractInfo[]> {
        return this.contractInfoProvider.find(condition, ...args);
    }

    async findByIds(contractIds: string[], ...args): Promise<ContractInfo[]> {
        return this.contractInfoProvider.find({_id: {$in: contractIds}}, ...args);
    }

    async findIntervalList(condition: object, skip?: number, limit?: number, projection?: string[], sort?: object): Promise<PageResult<ContractInfo>> {
        return this.contractInfoProvider.findIntervalList(condition, skip, limit, projection?.toString(), sort);
    }

    async count(condition: object): Promise<number> {
        return this.contractInfoProvider.count(condition);
    }

    async addContractChangedHistory(contract: ContractInfo, fromState: string, toState: string, event: string, triggerDate: Date) {
        const fsmStateTransitionInfo = {
            fromState, toState, event, triggerDate
        };
        await this.contractChangedHistoryProvider.create({
            contractId: contract.contractId,
            histories: [fsmStateTransitionInfo]
        });
        return this.contractChangedHistoryProvider.findOneAndUpdate({contractId: contract.contractId}, {
            $addToSet: {histories: fsmStateTransitionInfo},
        }, {new: true}).then(changeHistory => {
            return changeHistory || this.contractChangedHistoryProvider.create({
                contractId: contract.contractId,
                histories: [fsmStateTransitionInfo]
            });
        });
    }

    async addContractChangedHistoryAndLockFsmRunningStatus(contract: ContractInfo, fromState: string, toState: string, event: string, triggerDate: Date) {

        const fsmStateTransitionInfo = {
            fromState, toState, event, triggerDate
        };
        const existingHistoryInfo = await this.contractChangedHistoryProvider.findOne({contractId: contract.contractId}, {histories: {$slice: -1}} as any);
        if (existingHistoryInfo && !isEmpty(existingHistoryInfo.histories)) {
            const latestEventRecord: any = first(existingHistoryInfo.histories);
            // 逻辑上事件历史记录必须能够按状态机的事件接受顺序串联起来
            if (latestEventRecord.toState !== fsmStateTransitionInfo.fromState) {
                throw new LogicError(`please check contract event,add contract event history failed.contractId:${contract.contractId},eventId:${event}`);
            }
        }
        if (existingHistoryInfo) {
            await this.contractChangedHistoryProvider.updateOne({
                contractId: contract.contractId
            }, {$push: {histories: fsmStateTransitionInfo}});
        } else {
            await this.contractChangedHistoryProvider.create({
                contractId: contract.contractId,
                histories: [fsmStateTransitionInfo]
            });
        }
        return true;
        // return this.contractInfoProvider.updateOne({_id: contract.contractId}, {fsmRunningStatus: ContractFsmRunningStatusEnum.Locked});
    }

    /**
     * 给资源填充策略详情信息
     * @param contracts
     */
    async fillContractPolicyInfo(contracts: ContractInfo[]): Promise<ContractInfo[]> {
        if (!isArray(contracts) || isEmpty(contracts)) {
            return contracts;
        }
        const policyIds = chain(contracts).filter(x => isString(x?.policyId)).map(x => x.policyId).uniq().value();
        if (isEmpty(policyIds)) {
            return contracts;
        }
        const policyMap: Map<string, PolicyInfo> = await this.policyService.findByIds(policyIds, 'policyId policyName policyText fsmDescriptionInfo').then(list => {
            return new Map(list.map(x => [x.policyId, x]));
        });

        return contracts.map((item: any) => {
            const contractInfo = item.toObject ? item.toObject() : item;
            contractInfo.policyInfo = policyMap.get(contractInfo.policyId) ?? {};
            return contractInfo;
        });
    }

    /**
     * 获取签约数量
     * @param licenseeOwnerIds
     * @param licenseeIdentityType
     */
    async findLicenseeSignCounts(licenseeOwnerIds: number[], licenseeIdentityType: ContractLicenseeIdentityTypeEnum): Promise<Array<{ licensorOwnerId: number, count: number }>> {
        return this.contractInfoProvider.aggregate([
            {
                $match: {licensorOwnerId: {$in: licenseeOwnerIds}, licenseeIdentityType}
            },
            {
                $group: {_id: '$licenseeOwnerId', count: {$sum: 1}}
            },
            {
                $project: {_id: 0, licensorOwnerId: '$_id', count: '$count'}
            }
        ]);
    }

    /**
     * 检查合同是否可以重签
     * @param baseInfos
     * @private
     */
    async _checkIsCanReSignContracts(baseInfos: Array<{ subjectId: string, subjectType: SubjectTypeEnum, licenseeId: string | number, policyId: string, status: number, contractId?: string }>): Promise<any[]> {

        const contractUniqueKeys = baseInfos.map(baseInfo => {
            baseInfo['uniqueKey'] = this.contractInfoSignatureProvider.contractBaseInfoUniqueKeyGenerate(baseInfo);
            return baseInfo['uniqueKey'];
        });
        const hasSignedAndEfficientContracts = await this.find({uniqueKey: {$in: contractUniqueKeys}});

        return baseInfos.map(baseInfo => {
            const existingContract = hasSignedAndEfficientContracts.find(x => x.subjectId === baseInfo.subjectId && x.subjectType === baseInfo.subjectType && x.policyId === baseInfo.policyId && x.licenseeId.toString() === baseInfo.licenseeId.toString());
            return assign(baseInfo, {
                isCanReSign: !Boolean(existingContract),
                signedContractInfo: existingContract
            });
        });
    }

    /**
     * 初始化合约
     * @param contracts
     * @param subjectPolicyMap
     */
    async _initialContracts(contracts: ContractInfo[], subjectPolicyMap: Map<string, PolicyInfo>) {
        try {
            if (!contracts?.length) {
                return;
            }
            const session = await this.mongoose.startSession();
            return session.withTransaction(() => {
                const tasks = [];
                for (const contract of contracts) {
                    contract.policyInfo = subjectPolicyMap.get(contract.policyId);
                    tasks.push(this.buildContractStateMachine(contract).execInitial(session));
                }
                return Promise.all(tasks);
            }).catch().finally(() => session.endSession());
        } catch (error) {
            // 错误不用处理,后续有job会定期检查未初始化的合约
        }
    }
}
