import {isString, pick, chain, isArray, isEmpty, assign, isNumber} from 'lodash';
import {provide, inject, plugin} from 'midway';
import {
    ContractInfo,
    BeSignSubjectOptions,
    IContractService,
    IOutsideApiService,
    IPolicyService,
    PolicyInfo,
    SubjectBaseInfo, IContractStateMachine, ContractTransitionRecord
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
    contractInfoSignatureProvider;
    @inject()
    outsideApiService: IOutsideApiService;
    @inject()
    contractTransitionRecordProvider: IMongodbOperation<ContractTransitionRecord>;
    @inject()
    buildContractStateMachine: (contractInfo: ContractInfo) => IContractStateMachine;

    /**
     * 根据ID获取合约
     * @param contractId
     * @param isLoadingPolicy
     */
    async findContractById(contractId: string, isLoadingPolicy = false) {
        const contractInfo = await this.contractInfoProvider.findOne({_id: contractId});
        if (isLoadingPolicy) {
            await this.fillContractPolicyInfo([contractInfo]);
        }
        return contractInfo;
    }

    /**
     * 批量获取合约
     * @param contractIds
     * @param isLoadingPolicy
     */
    async findContractByIds(contractIds: string[], isLoadingPolicy = false) {
        const contracts = await this.contractInfoProvider.find({_id: {$in: contractIds}});
        if (isLoadingPolicy) {
            await this.fillContractPolicyInfo(contracts);
        }
        return contracts;
    }

    /**
     * C端用户签约展品
     * @param presentableId
     * @param policyId
     * @param licenseeId
     */
    async signClientUserPresentable(presentableId: string, policyId: string, licenseeId: number): Promise<ContractInfo[]> {
        const contracts = await this.batchSignSubjects([{
            subjectId: presentableId, policyId
        }], licenseeId, ContractLicenseeIdentityTypeEnum.ClientUser, SubjectTypeEnum.Presentable, true);

        return this.contractInfoProvider.find({_id: {$in: contracts.map(x => x.contractId)}});
    }

    /**
     * 批量签约标的物
     * @param subjects
     * @param licenseeId
     * @param licenseeIdentityType
     * @param subjectType
     * @param isWaitInitial
     */
    async batchSignSubjects(subjects: BeSignSubjectOptions[], licenseeId: string | number, licenseeIdentityType: ContractLicenseeIdentityTypeEnum, subjectType: SubjectTypeEnum, isWaitInitial = false): Promise<ContractInfo[]> {

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
        const invalidSubjectIds = [];
        const invalidPolicyIds = [];
        const beSignContracts = beSignSubjects.map(beSignSubject => {
            const subjectInfo = beSignSubjectMap.get(beSignSubject.subjectId);
            if (subjectInfo?.status !== 1) {
                invalidSubjectIds.push(subjectInfo.subjectId);
                return;
            }
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

        if (!isEmpty(invalidSubjectIds)) {
            throw new ApplicationError(this.ctx.gettext('sign-subject-invalid-error', '标的物不可用'), invalidPolicyIds);
        }
        if (!isEmpty(invalidPolicyIds)) {
            throw new ApplicationError(this.ctx.gettext('subject-policy-check-failed'), invalidPolicyIds);
        }

        let latestSignedContracts = await this.contractInfoProvider.insertMany(beSignContracts);

        if (isWaitInitial) {
            await this._initialContracts(latestSignedContracts, beSignSubjectPolicyMap).then(() => {
                return this.contractInfoProvider.find({_id: {$in: latestSignedContracts.map(x => x.contractId)}});
            }).then(contractList => {
                latestSignedContracts = contractList;
            }).catch();
        } else {
            this._initialContracts(latestSignedContracts, beSignSubjectPolicyMap).catch();
        }

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
        return this.contractInfoProvider.findIntervalList(condition, skip, limit, projection?.join(' '), sort);
    }

    async count(condition: object): Promise<number> {
        return this.contractInfoProvider.count(condition);
    }


    /**
     * 给资源填充策略详情信息
     * @param contracts
     * @param isTranslate
     */
    async fillContractPolicyInfo(contracts: ContractInfo[], isTranslate?: boolean): Promise<ContractInfo[]> {
        if (!isArray(contracts) || isEmpty(contracts)) {
            return contracts;
        }
        const policyIds = chain(contracts).filter(x => isString(x?.policyId)).map(x => x.policyId).uniq().value();
        if (isEmpty(policyIds)) {
            return contracts;
        }
        const policyMap: Map<string, PolicyInfo> = await this.policyService.findByIds(policyIds, 'policyId policyName policyText fsmDescriptionInfo').then(list => {
            if (isTranslate) {
                list = this.policyService.policyTranslate(list);
            }
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
     * 获取标的物签约次数(同一个用户去重)
     * @param subjectType
     * @param subjectIds
     */
    async findSubjectSignCounts(subjectType: SubjectTypeEnum, subjectIds: string[]) {

        const aggregates = [{
            $match: {
                subjectId: {$in: subjectIds}, subjectType
            }
        }, {
            $group: {
                _id: {subjectId: '$subjectId', licenseeId: '$licenseeId'}
            }
        }, {
            $group: {
                _id: '$_id.subjectId', count: {$sum: 1}
            }
        }, {
            $project: {
                _id: 0, subjectId: '$_id', count: '$count'
            }
        }];

        return this.contractInfoProvider.aggregate(aggregates);
    }

    /**
     * 查询合同流转记录
     * @param condition
     * @param projection
     * @param options
     */
    async findContractTransitionRecords(condition: object, projection?: string, options?: object): Promise<ContractTransitionRecord[]> {
        return this.contractTransitionRecordProvider.find(condition, projection, options);
    }

    /**
     * 分页查询合约流转记录
     * @param condition
     * @param skip
     * @param limit
     * @param projection
     * @param sort
     */
    async findIntervalContractTransitionRecords(condition: object, skip?: number, limit?: number, projection?: string[], sort?: object): Promise<PageResult<ContractTransitionRecord>> {
        return this.contractTransitionRecordProvider.findIntervalList(condition, skip, limit, projection?.join(' '), sort);
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
                isCanReSign: !Boolean(existingContract), signedContractInfo: existingContract
            });
        });
    }

    /**
     * 初始化合约
     * @param contracts
     * @param subjectPolicyMap
     */
    async _initialContracts(contracts: ContractInfo[], subjectPolicyMap: Map<string, PolicyInfo>) {
        const session = await this.mongoose.startSession();
        await session.withTransaction(() => {
            const tasks = [];
            for (const contract of contracts) {
                contract.policyInfo = subjectPolicyMap.get(contract.policyId);
                tasks.push(this.buildContractStateMachine(contract).execInitial(session));
            }
            return Promise.all(tasks) as any;
        }).catch(error => {
            console.log('合约初始化错误,message:' + error.toString());
        }).finally(() => {
            session.endSession();
        });
    }
}
