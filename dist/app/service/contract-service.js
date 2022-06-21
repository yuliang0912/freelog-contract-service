"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractService = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const enum_1 = require("../../enum");
const egg_freelog_base_1 = require("egg-freelog-base");
const resource_policy_lang_1 = require("@freelog/resource-policy-lang");
const moment = require("moment");
let ContractService = class ContractService {
    mongoose;
    ctx;
    contractInfoProvider;
    policyService;
    contractInfoSignatureProvider;
    outsideApiService;
    contractTransitionRecordProvider;
    buildContractStateMachine;
    /**
     * 根据ID获取合约
     * @param contractId
     * @param isLoadingPolicy
     */
    async findContractById(contractId, isLoadingPolicy = false) {
        const contractInfo = await this.contractInfoProvider.findOne({ _id: contractId });
        if (!isLoadingPolicy) {
            return contractInfo;
        }
        return this.fillContractPolicyInfo([contractInfo]).then(lodash_1.first);
    }
    /**
     * 批量获取合约
     * @param contractIds
     * @param isLoadingPolicy
     */
    async findContractByIds(contractIds, isLoadingPolicy = false) {
        const contracts = await this.contractInfoProvider.find({ _id: { $in: contractIds } });
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
    async signClientUserPresentable(presentableId, policyId, licenseeId) {
        const contracts = await this.batchSignSubjects([{
                subjectId: presentableId, policyId
            }], licenseeId, egg_freelog_base_1.ContractLicenseeIdentityTypeEnum.ClientUser, egg_freelog_base_1.SubjectTypeEnum.Presentable, true);
        return this.contractInfoProvider.find({ _id: { $in: contracts.map(x => x.contractId) } });
    }
    /**
     * 批量签约标的物
     * @param subjects
     * @param licenseeId
     * @param licenseeIdentityType
     * @param subjectType
     * @param isWaitInitial
     */
    async batchSignSubjects(subjects, licenseeId, licenseeIdentityType, subjectType, isWaitInitial = false) {
        // console.log('参数传递待签约标的物数量:' + subjects.map(x => x.policyId).toString());
        const reSignCheckResults = await this._checkIsCanReSignContracts(subjects.map(subject => Object({
            subjectType, licenseeId,
            subjectId: subject.subjectId,
            policyId: subject.policyId
        })));
        const beSignSubjects = reSignCheckResults.filter(x => x.isCanReSign);
        // console.log('系统检测需要真实签约的标的物:' + beSignSubjects.map(x => x.policyId).toString());
        // 已经签约并且生效中的合约不允许重签(生效中:未终止的或者系统判定异常的)
        const hasSignedAndEfficientContracts = reSignCheckResults.filter(x => !x.isCanReSign).map(x => x.signedContractInfo);
        // console.log('系统检测已存在合约的标的物策略:' + hasSignedAndEfficientContracts.map(x => x.policyId).toString());
        if ((0, lodash_1.isEmpty)(beSignSubjects)) {
            return hasSignedAndEfficientContracts;
        }
        const { licenseeName, licenseeOwnerId, licenseeOwnerName } = await this.outsideApiService.getLicenseeInfo(licenseeId, licenseeIdentityType);
        const beSignSubjectMap = await this.outsideApiService.getSubjectInfos(beSignSubjects.map(x => x.subjectId), subjectType).then(list => {
            return new Map(list.map(x => [x.subjectId, x]));
        });
        const beSignSubjectPolicyMap = await this.policyService.findByIds(beSignSubjects.map(x => x.policyId)).then(list => new Map(list.map(x => [x.policyId, x])));
        const invalidSubjectIds = [];
        const invalidPolicyIds = [];
        const beSignContracts = beSignSubjects.map(beSignSubject => {
            const subjectInfo = beSignSubjectMap.get(beSignSubject.subjectId);
            if (subjectInfo?.status !== 1) {
                invalidSubjectIds.push(subjectInfo.subjectId);
                return;
            }
            const { licensorId, licensorName, licensorOwnerId, policies, licensorOwnerName, subjectId, subjectName, subjectType } = subjectInfo;
            const subjectPolicyInfo = policies.find(x => x.policyId === beSignSubject.policyId);
            if (!subjectPolicyInfo || subjectPolicyInfo.status !== 1 || !beSignSubjectPolicyMap.has(beSignSubject.policyId)) {
                invalidPolicyIds.push({ subjectId: beSignSubject.subjectId, policyId: beSignSubject.policyId });
                return;
            }
            const contract = {
                licensorId, licensorName, licensorOwnerId, licensorOwnerName,
                licenseeId, licenseeName, licenseeOwnerId, licenseeOwnerName, licenseeIdentityType,
                subjectId, subjectName, subjectType,
                contractId: this.mongoose.getNewObjectId(),
                contractName: subjectPolicyInfo.policyName,
                policyId: subjectPolicyInfo.policyId,
                fsmCurrentState: '',
                authStatus: enum_1.ContractAuthStatusEnum.Unauthorized,
                status: egg_freelog_base_1.ContractStatusEnum.Executed,
                fsmRunningStatus: enum_1.ContractFsmRunningStatusEnum.Uninitialized,
                createDate: new Date()
            };
            contract.signature = this.contractInfoSignatureProvider.contractBaseInfoSignature(contract);
            contract.uniqueKey = this.contractInfoSignatureProvider.contractBaseInfoUniqueKeyGenerate(contract);
            return contract;
        });
        if (!(0, lodash_1.isEmpty)(invalidSubjectIds)) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('sign-subject-invalid-error', '标的物不可用'), invalidPolicyIds);
        }
        if (!(0, lodash_1.isEmpty)(invalidPolicyIds)) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('subject-policy-check-failed'), invalidPolicyIds);
        }
        let latestSignedContracts = await this.contractInfoProvider.insertMany(beSignContracts);
        if (isWaitInitial) {
            await this._initialContracts(latestSignedContracts, beSignSubjectPolicyMap).then(() => {
                return this.contractInfoProvider.find({ _id: { $in: latestSignedContracts.map(x => x.contractId) } });
            }).then(contractList => {
                latestSignedContracts = contractList;
            }).catch();
        }
        else {
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
    async updateContractInfo(contract, options) {
        const model = {};
        if ((0, lodash_1.isString)(options.contractName)) {
            model.contractName = options.contractName;
        }
        if ((0, lodash_1.isNumber)(options.sortId)) {
            model.sortId = options.sortId;
        }
        if ((0, lodash_1.isNumber)(options.authStatus)) {
            model.authStatus = options.authStatus;
        }
        if ((0, lodash_1.isNumber)(options.status)) {
            model.authStatus = options.status;
        }
        if ((0, lodash_1.isNumber)(options.fsmRunningStatus)) {
            model.fsmRunningStatus = options.fsmRunningStatus;
        }
        if ((0, lodash_1.isString)(options.fsmCurrentState) && options.fsmCurrentState.length) {
            model.fsmCurrentState = options.fsmCurrentState;
        }
        if (!Object.keys(model).length) {
            throw new egg_freelog_base_1.ArgumentError('params is invalid');
        }
        return this.contractInfoProvider.updateOne({ _id: contract.contractId }, model).then(data => Boolean(data.ok));
    }
    /**
     * 设置默认执行合同
     * @param {ContractInfo} contract
     * @returns {Promise<boolean>}
     */
    async setDefaultExecContract(contract) {
        if (contract.licenseeIdentityType !== egg_freelog_base_1.ContractLicenseeIdentityTypeEnum.ClientUser) {
            throw new egg_freelog_base_1.LogicError('please check contractType');
        }
        await this.contractInfoProvider.updateMany((0, lodash_1.pick)(contract, ['subjectId', 'subjectType', 'licenseeId']), { sortId: 0 });
        return this.contractInfoProvider.updateOne({ _id: contract.contractId }, { sortId: 1 }).then(data => Boolean(data.ok));
    }
    async findOne(condition, ...args) {
        return this.contractInfoProvider.findOne(condition, ...args);
    }
    async findById(contractId, ...args) {
        return this.contractInfoProvider.findById(contractId, ...args);
    }
    async find(condition, ...args) {
        return this.contractInfoProvider.find(condition, ...args);
    }
    async findByIds(contractIds, ...args) {
        return this.contractInfoProvider.find({ _id: { $in: contractIds } }, ...args);
    }
    async findIntervalList(condition, skip, limit, projection, sort) {
        return this.contractInfoProvider.findIntervalList(condition, skip, limit, projection?.join(' '), sort);
    }
    async count(condition) {
        return this.contractInfoProvider.count(condition);
    }
    /**
     * 给资源填充策略详情信息
     * @param contracts
     * @param isTranslate
     */
    async fillContractPolicyInfo(contracts, isTranslate) {
        if (!(0, lodash_1.isArray)(contracts) || (0, lodash_1.isEmpty)(contracts)) {
            return contracts;
        }
        const policyIds = (0, lodash_1.chain)(contracts).filter(x => (0, lodash_1.isString)(x?.policyId)).map(x => x.policyId).uniq().value();
        if ((0, lodash_1.isEmpty)(policyIds)) {
            return contracts;
        }
        const policyMap = await this.policyService.findByIds(policyIds).then(list => {
            if (isTranslate) {
                list = this.policyService.policyTranslate(list);
            }
            return new Map(list.map(x => [x.policyId, x]));
        });
        return contracts.map((item) => {
            const contractInfo = item.toObject ? item.toObject() : item;
            contractInfo.policyInfo = policyMap.get(contractInfo.policyId) ?? {};
            return contractInfo;
        });
    }
    /**
     * 合约流转记录翻译
     * @param policyInfo
     * @param contractTransitionRecord
     */
    contractTransitionRecordTranslate(policyInfo, contractTransitionRecord) {
        const records = contractTransitionRecord.dataList.reverse().map(x => {
            return {
                id: x.stateId,
                fromState: x.fromState === '_none_' ? null : x.fromState,
                toState: x.toState,
                time: moment(x.eventInfo.eventTime).format('YYYY-MM-DD HH:mm:ss'),
                event: policyInfo.fsmDescriptionInfo[x.fromState]?.transitions.find(x => x.eventId === x.eventId) ?? null
            };
        });
        // 第一页数据,则最后一条是尾部
        if (contractTransitionRecord.skip === 0) {
            (0, lodash_1.last)(records).isLast = true;
        }
        const { fsmTransferResults } = (0, resource_policy_lang_1.transfer)(policyInfo.fsmDescriptionInfo, records);
        contractTransitionRecord.dataList = fsmTransferResults.reverse();
        return contractTransitionRecord;
    }
    /**
     * 获取签约数量
     * @param licenseeOwnerIds
     * @param licenseeIdentityType
     */
    async findLicenseeSignCounts(licenseeOwnerIds, licenseeIdentityType) {
        return this.contractInfoProvider.aggregate([
            {
                $match: { licensorOwnerId: { $in: licenseeOwnerIds }, licenseeIdentityType }
            },
            {
                $group: { _id: '$licenseeOwnerId', count: { $sum: 1 } }
            },
            {
                $project: { _id: 0, licensorOwnerId: '$_id', count: '$count' }
            }
        ]);
    }
    /**
     * 通用签约次数统计(按合约签约数)
     * @param condition
     * @param statisticalField
     */
    async commonSignCounts(condition, statisticalField) {
        const aggregates = [{
                $match: condition
            }, {
                $group: {
                    _id: `$${statisticalField}`, count: { $sum: 1 }
                }
            }, {
                $project: {
                    _id: 0, key: '$_id', count: '$count'
                }
            }];
        return this.contractInfoProvider.aggregate(aggregates);
    }
    /**
     * 获取标的物签约次数(同一个用户去重)
     * @param subjectType
     * @param subjectIds
     */
    async findSubjectSignCounts(condition) {
        const aggregates = [{
                $match: condition
            }, {
                $group: {
                    _id: { subjectId: '$subjectId', licenseeId: '$licenseeId' }
                }
            }, {
                $group: {
                    _id: '$_id.subjectId', count: { $sum: 1 }
                }
            }, {
                $project: {
                    _id: 0, subjectId: '$_id', count: '$count'
                }
            }];
        return this.contractInfoProvider.aggregate(aggregates);
    }
    async findLicensorSignCounts(condition) {
        const aggregates = [{
                $match: condition
            }, {
                // 同一个甲方,同一个乙方,同一个标的物即使签约多次也只计算一次.例如签约多个策略,或者策略过期了,续签. 最终统计按人头,而非合约数
                $group: {
                    _id: { licensorId: '$licensorId', licenseeId: '$licenseeId', subjectId: '$subjectId' }
                }
            }, {
                $group: {
                    _id: '$_id.licensorId', count: { $sum: 1 }
                }
            }, {
                $project: {
                    _id: 0, licensorId: '$_id', count: '$count'
                }
            }];
        return this.contractInfoProvider.aggregate(aggregates);
    }
    /**
     * 获取标的物签约次数(同一个用户去重)
     * @param condition
     */
    async findSubjectSignGroups(condition) {
        const aggregates = [{ $match: condition }, {
                $group: {
                    _id: '$subjectId',
                    subjectName: { $first: '$subjectName' },
                    policyIds: { $addToSet: '$policyId' },
                    latestSignDate: { $last: '$createDate' },
                    authStatusList: { $addToSet: '$authStatus' },
                    count: { $sum: 1 }
                }
            }, {
                $sort: { latestSignDate: -1 }
            }, {
                $project: {
                    _id: 0,
                    subjectId: '$_id',
                    subjectName: '$subjectName',
                    policyIds: '$policyIds',
                    authStatusList: '$authStatusList',
                    latestSignDate: '$latestSignDate',
                    count: '$count'
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
    async findContractTransitionRecords(condition, projection, options) {
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
    async findIntervalContractTransitionRecords(condition, skip, limit, projection, sort) {
        return this.contractTransitionRecordProvider.findIntervalList(condition, skip, limit, projection?.join(' '), sort);
    }
    /**
     * 检查合同是否可以重签
     * @param baseInfos
     * @private
     */
    async _checkIsCanReSignContracts(baseInfos) {
        const contractUniqueKeys = baseInfos.map(baseInfo => {
            baseInfo['uniqueKey'] = this.contractInfoSignatureProvider.contractBaseInfoUniqueKeyGenerate(baseInfo);
            return baseInfo['uniqueKey'];
        });
        const hasSignedAndEfficientContracts = await this.find({ uniqueKey: { $in: contractUniqueKeys } });
        return baseInfos.map(baseInfo => {
            const existingContract = hasSignedAndEfficientContracts.find(x => x.subjectId === baseInfo.subjectId && x.policyId === baseInfo.policyId);
            return (0, lodash_1.assign)(baseInfo, {
                isCanReSign: !Boolean(existingContract), signedContractInfo: existingContract
            });
        });
    }
    // async update() {
    //     const contracts = await this.contractInfoProvider.find({status: ContractStatusEnum.Terminated});
    //     for (const item of contracts) {
    //         const uniqueKey = this.contractInfoSignatureProvider.contractBaseInfoUniqueKeyGenerate(item);
    //         this.contractInfoProvider.updateOne({_id: item.contractId}, {uniqueKey}).then();
    //     }
    // }
    /**
     * 初始化合约
     * @param contracts
     * @param subjectPolicyMap
     */
    async _initialContracts(contracts, subjectPolicyMap) {
        const session = await this.mongoose.startSession();
        await session.withTransaction(() => {
            const tasks = [];
            for (const contract of contracts) {
                contract.policyInfo = subjectPolicyMap.get(contract.policyId);
                tasks.push(this.buildContractStateMachine(contract).execInitial(session));
            }
            return Promise.all(tasks);
        }).catch(error => {
            console.log('合约初始化错误,message:' + error.toString());
        }).finally(() => {
            session.endSession();
        });
    }
};
__decorate([
    (0, midway_1.plugin)(),
    __metadata("design:type", Object)
], ContractService.prototype, "mongoose", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ContractService.prototype, "ctx", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ContractService.prototype, "contractInfoProvider", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ContractService.prototype, "policyService", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ContractService.prototype, "contractInfoSignatureProvider", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ContractService.prototype, "outsideApiService", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ContractService.prototype, "contractTransitionRecordProvider", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Function)
], ContractService.prototype, "buildContractStateMachine", void 0);
ContractService = __decorate([
    (0, midway_1.provide)('contractService')
], ContractService);
exports.ContractService = ContractService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3Qtc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9jb250cmFjdC1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUE4RjtBQUM5RixtQ0FBK0M7QUFZL0MscUNBQWdGO0FBQ2hGLHVEQVUwQjtBQUMxQix3RUFBdUQ7QUFDdkQsaUNBQWtDO0FBR2xDLElBQWEsZUFBZSxHQUE1QixNQUFhLGVBQWU7SUFHeEIsUUFBUSxDQUFDO0lBRVQsR0FBRyxDQUFpQjtJQUVwQixvQkFBb0IsQ0FBa0M7SUFFdEQsYUFBYSxDQUFpQjtJQUU5Qiw2QkFBNkIsQ0FBQztJQUU5QixpQkFBaUIsQ0FBcUI7SUFFdEMsZ0NBQWdDLENBQThDO0lBRTlFLHlCQUF5QixDQUF3RDtJQUVqRjs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFVBQWtCLEVBQUUsZUFBZSxHQUFHLEtBQUs7UUFDOUQsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLEVBQUMsR0FBRyxFQUFFLFVBQVUsRUFBQyxDQUFDLENBQUM7UUFDaEYsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUNsQixPQUFPLFlBQVksQ0FBQztTQUN2QjtRQUNELE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBSyxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsaUJBQWlCLENBQUMsV0FBcUIsRUFBRSxlQUFlLEdBQUcsS0FBSztRQUNsRSxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUUsRUFBQyxHQUFHLEVBQUUsV0FBVyxFQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQ2xGLElBQUksZUFBZSxFQUFFO1lBQ2pCLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQ2hEO1FBQ0QsT0FBTyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLHlCQUF5QixDQUFDLGFBQXFCLEVBQUUsUUFBZ0IsRUFBRSxVQUFrQjtRQUN2RixNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUM1QyxTQUFTLEVBQUUsYUFBYSxFQUFFLFFBQVE7YUFDckMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxtREFBZ0MsQ0FBQyxVQUFVLEVBQUUsa0NBQWUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFaEcsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEVBQUMsR0FBRyxFQUFFLEVBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUMsRUFBQyxDQUFDLENBQUM7SUFDMUYsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxLQUFLLENBQUMsaUJBQWlCLENBQUMsUUFBZ0MsRUFBRSxVQUEyQixFQUFFLG9CQUFzRCxFQUFFLFdBQTRCLEVBQUUsYUFBYSxHQUFHLEtBQUs7UUFFOUwsMkVBQTJFO1FBQzNFLE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUM1RixXQUFXLEVBQUUsVUFBVTtZQUN2QixTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVM7WUFDNUIsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRO1NBQzdCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFTCxNQUFNLGNBQWMsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDckUsbUZBQW1GO1FBQ25GLHVDQUF1QztRQUN2QyxNQUFNLDhCQUE4QixHQUFHLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3JILG9HQUFvRztRQUNwRyxJQUFJLElBQUEsZ0JBQU8sRUFBQyxjQUFjLENBQUMsRUFBRTtZQUN6QixPQUFPLDhCQUE4QixDQUFDO1NBQ3pDO1FBRUQsTUFBTSxFQUNGLFlBQVksRUFDWixlQUFlLEVBQ2YsaUJBQWlCLEVBQ3BCLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBQ25GLE1BQU0sZ0JBQWdCLEdBQWlDLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMvSixPQUFPLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BELENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxzQkFBc0IsR0FBNEIsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0TCxNQUFNLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztRQUM3QixNQUFNLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztRQUM1QixNQUFNLGVBQWUsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQ3ZELE1BQU0sV0FBVyxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEUsSUFBSSxXQUFXLEVBQUUsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDM0IsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDOUMsT0FBTzthQUNWO1lBQ0QsTUFBTSxFQUNGLFVBQVUsRUFDVixZQUFZLEVBQ1osZUFBZSxFQUNmLFFBQVEsRUFDUixpQkFBaUIsRUFDakIsU0FBUyxFQUNULFdBQVcsRUFDWCxXQUFXLEVBQ2QsR0FBRyxXQUFXLENBQUM7WUFDaEIsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsS0FBSyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDcEYsSUFBSSxDQUFDLGlCQUFpQixJQUFJLGlCQUFpQixDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUM3RyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsYUFBYSxDQUFDLFFBQVEsRUFBQyxDQUFDLENBQUM7Z0JBQzlGLE9BQU87YUFDVjtZQUNELE1BQU0sUUFBUSxHQUFpQjtnQkFDM0IsVUFBVSxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsaUJBQWlCO2dCQUM1RCxVQUFVLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxpQkFBaUIsRUFBRSxvQkFBb0I7Z0JBQ2xGLFNBQVMsRUFBRSxXQUFXLEVBQUUsV0FBVztnQkFDbkMsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFO2dCQUMxQyxZQUFZLEVBQUUsaUJBQWlCLENBQUMsVUFBVTtnQkFDMUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLFFBQVE7Z0JBQ3BDLGVBQWUsRUFBRSxFQUFFO2dCQUNuQixVQUFVLEVBQUUsNkJBQXNCLENBQUMsWUFBWTtnQkFDL0MsTUFBTSxFQUFFLHFDQUFrQixDQUFDLFFBQVE7Z0JBQ25DLGdCQUFnQixFQUFFLG1DQUE0QixDQUFDLGFBQWE7Z0JBQzVELFVBQVUsRUFBRSxJQUFJLElBQUksRUFBRTthQUN6QixDQUFDO1lBQ0YsUUFBUSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsNkJBQTZCLENBQUMseUJBQXlCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDNUYsUUFBUSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsNkJBQTZCLENBQUMsaUNBQWlDLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDcEcsT0FBTyxRQUFRLENBQUM7UUFDcEIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsSUFBQSxnQkFBTyxFQUFDLGlCQUFpQixDQUFDLEVBQUU7WUFDN0IsTUFBTSxJQUFJLG1DQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLDRCQUE0QixFQUFFLFFBQVEsQ0FBQyxFQUFFLGdCQUFnQixDQUFDLENBQUM7U0FDMUc7UUFDRCxJQUFJLENBQUMsSUFBQSxnQkFBTyxFQUFDLGdCQUFnQixDQUFDLEVBQUU7WUFDNUIsTUFBTSxJQUFJLG1DQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLDZCQUE2QixDQUFDLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztTQUNqRztRQUVELElBQUkscUJBQXFCLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBRXhGLElBQUksYUFBYSxFQUFFO1lBQ2YsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMscUJBQXFCLEVBQUUsc0JBQXNCLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNsRixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUUsRUFBQyxHQUFHLEVBQUUscUJBQXFCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFDLEVBQUMsQ0FBQyxDQUFDO1lBQ3RHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRTtnQkFDbkIscUJBQXFCLEdBQUcsWUFBWSxDQUFDO1lBQ3pDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ2Q7YUFBTTtZQUNILElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxxQkFBcUIsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ2pGO1FBRUQsT0FBTyxDQUFDLEdBQUcscUJBQXFCLEVBQUUsR0FBRyw4QkFBOEIsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxRQUFzQixFQUFFLE9BQVk7UUFDekQsTUFBTSxLQUFLLEdBQVEsRUFBRSxDQUFDO1FBQ3RCLElBQUksSUFBQSxpQkFBUSxFQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUNoQyxLQUFLLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7U0FDN0M7UUFDRCxJQUFJLElBQUEsaUJBQVEsRUFBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDMUIsS0FBSyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1NBQ2pDO1FBQ0QsSUFBSSxJQUFBLGlCQUFRLEVBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzlCLEtBQUssQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztTQUN6QztRQUNELElBQUksSUFBQSxpQkFBUSxFQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUMxQixLQUFLLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7U0FDckM7UUFDRCxJQUFJLElBQUEsaUJBQVEsRUFBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtZQUNwQyxLQUFLLENBQUMsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDO1NBQ3JEO1FBQ0QsSUFBSSxJQUFBLGlCQUFRLEVBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFO1lBQ3JFLEtBQUssQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQztTQUNuRDtRQUNELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRTtZQUM1QixNQUFNLElBQUksZ0NBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1NBQ2hEO1FBQ0QsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLEVBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxVQUFVLEVBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDakgsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsc0JBQXNCLENBQUMsUUFBc0I7UUFFL0MsSUFBSSxRQUFRLENBQUMsb0JBQW9CLEtBQUssbURBQWdDLENBQUMsVUFBVSxFQUFFO1lBQy9FLE1BQU0sSUFBSSw2QkFBVSxDQUFDLDJCQUEyQixDQUFDLENBQUM7U0FDckQ7UUFFRCxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsSUFBQSxhQUFJLEVBQUMsUUFBUSxFQUFFLENBQUMsV0FBVyxFQUFFLGFBQWEsRUFBRSxZQUFZLENBQUMsQ0FBQyxFQUFFLEVBQUMsTUFBTSxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUM7UUFFcEgsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLEVBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxVQUFVLEVBQUMsRUFBRSxFQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN2SCxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFpQixFQUFFLEdBQUcsSUFBSTtRQUNwQyxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDakUsQ0FBQztJQUVELEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBa0IsRUFBRSxHQUFHLElBQUk7UUFDdEMsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQWlCLEVBQUUsR0FBRyxJQUFJO1FBQ2pDLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFxQixFQUFFLEdBQUcsSUFBSTtRQUMxQyxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUUsRUFBQyxHQUFHLEVBQUUsV0FBVyxFQUFDLEVBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQzlFLENBQUM7SUFFRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsU0FBaUIsRUFBRSxJQUFhLEVBQUUsS0FBYyxFQUFFLFVBQXFCLEVBQUUsSUFBYTtRQUN6RyxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzNHLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQWlCO1FBQ3pCLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBR0Q7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxTQUF5QixFQUFFLFdBQXFCO1FBQ3pFLElBQUksQ0FBQyxJQUFBLGdCQUFPLEVBQUMsU0FBUyxDQUFDLElBQUksSUFBQSxnQkFBTyxFQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzNDLE9BQU8sU0FBUyxDQUFDO1NBQ3BCO1FBQ0QsTUFBTSxTQUFTLEdBQUcsSUFBQSxjQUFLLEVBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBQSxpQkFBUSxFQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMxRyxJQUFJLElBQUEsZ0JBQU8sRUFBQyxTQUFTLENBQUMsRUFBRTtZQUNwQixPQUFPLFNBQVMsQ0FBQztTQUNwQjtRQUNELE1BQU0sU0FBUyxHQUE0QixNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNqRyxJQUFJLFdBQVcsRUFBRTtnQkFDYixJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDbkQ7WUFDRCxPQUFPLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBUyxFQUFFLEVBQUU7WUFDL0IsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDNUQsWUFBWSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDckUsT0FBTyxZQUFZLENBQUM7UUFDeEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGlDQUFpQyxDQUFDLFVBQXNCLEVBQUUsd0JBQThEO1FBRXBILE1BQU0sT0FBTyxHQUFVLHdCQUF3QixDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDdkUsT0FBTztnQkFDSCxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU87Z0JBQ2IsU0FBUyxFQUFFLENBQUMsQ0FBQyxTQUFTLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO2dCQUN4RCxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU87Z0JBQ2xCLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUM7Z0JBQ2pFLEtBQUssRUFBRSxVQUFVLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJO2FBQzVHLENBQUM7UUFDTixDQUFDLENBQUMsQ0FBQztRQUNILGlCQUFpQjtRQUNqQixJQUFJLHdCQUF3QixDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7WUFDckMsSUFBQSxhQUFJLEVBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztTQUMvQjtRQUVELE1BQU0sRUFBQyxrQkFBa0IsRUFBQyxHQUFHLElBQUEsK0JBQVEsRUFBQyxVQUFVLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDOUUsd0JBQXdCLENBQUMsUUFBUSxHQUFHLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pFLE9BQU8sd0JBQXdCLENBQUM7SUFDcEMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsc0JBQXNCLENBQUMsZ0JBQTBCLEVBQUUsb0JBQXNEO1FBQzNHLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQztZQUN2QztnQkFDSSxNQUFNLEVBQUUsRUFBQyxlQUFlLEVBQUUsRUFBQyxHQUFHLEVBQUUsZ0JBQWdCLEVBQUMsRUFBRSxvQkFBb0IsRUFBQzthQUMzRTtZQUNEO2dCQUNJLE1BQU0sRUFBRSxFQUFDLEdBQUcsRUFBRSxrQkFBa0IsRUFBRSxLQUFLLEVBQUUsRUFBQyxJQUFJLEVBQUUsQ0FBQyxFQUFDLEVBQUM7YUFDdEQ7WUFDRDtnQkFDSSxRQUFRLEVBQUUsRUFBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLGVBQWUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBQzthQUMvRDtTQUNKLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFNBQWlCLEVBQUUsZ0JBQXdCO1FBRTlELE1BQU0sVUFBVSxHQUFHLENBQUM7Z0JBQ2hCLE1BQU0sRUFBRSxTQUFTO2FBQ3BCLEVBQUU7Z0JBQ0MsTUFBTSxFQUFFO29CQUNKLEdBQUcsRUFBRSxJQUFJLGdCQUFnQixFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUMsSUFBSSxFQUFFLENBQUMsRUFBQztpQkFDaEQ7YUFDSixFQUFFO2dCQUNDLFFBQVEsRUFBRTtvQkFDTixHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVE7aUJBQ3ZDO2FBQ0osQ0FBQyxDQUFDO1FBQ0gsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLHFCQUFxQixDQUFDLFNBQWlCO1FBRXpDLE1BQU0sVUFBVSxHQUFHLENBQUM7Z0JBQ2hCLE1BQU0sRUFBRSxTQUFTO2FBQ3BCLEVBQUU7Z0JBQ0MsTUFBTSxFQUFFO29CQUNKLEdBQUcsRUFBRSxFQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBQztpQkFDNUQ7YUFDSixFQUFFO2dCQUNDLE1BQU0sRUFBRTtvQkFDSixHQUFHLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLEVBQUMsSUFBSSxFQUFFLENBQUMsRUFBQztpQkFDMUM7YUFDSixFQUFFO2dCQUNDLFFBQVEsRUFBRTtvQkFDTixHQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVE7aUJBQzdDO2FBQ0osQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRCxLQUFLLENBQUMsc0JBQXNCLENBQUMsU0FBaUI7UUFFMUMsTUFBTSxVQUFVLEdBQUcsQ0FBQztnQkFDaEIsTUFBTSxFQUFFLFNBQVM7YUFDcEIsRUFBRTtnQkFDQyxvRUFBb0U7Z0JBQ3BFLE1BQU0sRUFBRTtvQkFDSixHQUFHLEVBQUUsRUFBQyxVQUFVLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBQztpQkFDdkY7YUFDSixFQUFFO2dCQUNDLE1BQU0sRUFBRTtvQkFDSixHQUFHLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLEVBQUMsSUFBSSxFQUFFLENBQUMsRUFBQztpQkFDM0M7YUFDSixFQUFFO2dCQUNDLFFBQVEsRUFBRTtvQkFDTixHQUFHLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVE7aUJBQzlDO2FBQ0osQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMscUJBQXFCLENBQUMsU0FBaUI7UUFFekMsTUFBTSxVQUFVLEdBQUcsQ0FBQyxFQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUMsRUFBRTtnQkFDckMsTUFBTSxFQUFFO29CQUNKLEdBQUcsRUFBRSxZQUFZO29CQUNqQixXQUFXLEVBQUUsRUFBQyxNQUFNLEVBQUUsY0FBYyxFQUFDO29CQUNyQyxTQUFTLEVBQUUsRUFBQyxTQUFTLEVBQUUsV0FBVyxFQUFDO29CQUNuQyxjQUFjLEVBQUUsRUFBQyxLQUFLLEVBQUUsYUFBYSxFQUFDO29CQUN0QyxjQUFjLEVBQUUsRUFBQyxTQUFTLEVBQUUsYUFBYSxFQUFDO29CQUMxQyxLQUFLLEVBQUUsRUFBQyxJQUFJLEVBQUUsQ0FBQyxFQUFDO2lCQUNuQjthQUNKLEVBQUU7Z0JBQ0MsS0FBSyxFQUFFLEVBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxFQUFDO2FBQzlCLEVBQUU7Z0JBQ0MsUUFBUSxFQUFFO29CQUNOLEdBQUcsRUFBRSxDQUFDO29CQUNOLFNBQVMsRUFBRSxNQUFNO29CQUNqQixXQUFXLEVBQUUsY0FBYztvQkFDM0IsU0FBUyxFQUFFLFlBQVk7b0JBQ3ZCLGNBQWMsRUFBRSxpQkFBaUI7b0JBQ2pDLGNBQWMsRUFBRSxpQkFBaUI7b0JBQ2pDLEtBQUssRUFBRSxRQUFRO2lCQUNsQjthQUNKLENBQUMsQ0FBQztRQUNILE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMsNkJBQTZCLENBQUMsU0FBaUIsRUFBRSxVQUFtQixFQUFFLE9BQWdCO1FBQ3hGLE9BQU8sSUFBSSxDQUFDLGdDQUFnQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3RGLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsS0FBSyxDQUFDLHFDQUFxQyxDQUFDLFNBQWlCLEVBQUUsSUFBYSxFQUFFLEtBQWMsRUFBRSxVQUFxQixFQUFFLElBQWE7UUFDOUgsT0FBTyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN2SCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxTQUF5SjtRQUV0TCxNQUFNLGtCQUFrQixHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDaEQsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxpQ0FBaUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2RyxPQUFPLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sOEJBQThCLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUMsU0FBUyxFQUFFLEVBQUMsR0FBRyxFQUFFLGtCQUFrQixFQUFDLEVBQUMsQ0FBQyxDQUFDO1FBRS9GLE9BQU8sU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUM1QixNQUFNLGdCQUFnQixHQUFHLDhCQUE4QixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLEtBQUssUUFBUSxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMxSSxPQUFPLElBQUEsZUFBTSxFQUFDLFFBQVEsRUFBRTtnQkFDcEIsV0FBVyxFQUFFLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsa0JBQWtCLEVBQUUsZ0JBQWdCO2FBQ2hGLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELG1CQUFtQjtJQUNuQix1R0FBdUc7SUFDdkcsc0NBQXNDO0lBQ3RDLHdHQUF3RztJQUN4RywyRkFBMkY7SUFDM0YsUUFBUTtJQUNSLElBQUk7SUFFSjs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLGlCQUFpQixDQUFDLFNBQXlCLEVBQUUsZ0JBQXlDO1FBQ3hGLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNuRCxNQUFNLE9BQU8sQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFO1lBQy9CLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUNqQixLQUFLLE1BQU0sUUFBUSxJQUFJLFNBQVMsRUFBRTtnQkFDOUIsUUFBUSxDQUFDLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM5RCxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzthQUM3RTtZQUNELE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQVEsQ0FBQztRQUNyQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDYixPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZELENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7WUFDWixPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0osQ0FBQTtBQXZkRztJQURDLElBQUEsZUFBTSxHQUFFOztpREFDQTtBQUVUO0lBREMsSUFBQSxlQUFNLEdBQUU7OzRDQUNXO0FBRXBCO0lBREMsSUFBQSxlQUFNLEdBQUU7OzZEQUM2QztBQUV0RDtJQURDLElBQUEsZUFBTSxHQUFFOztzREFDcUI7QUFFOUI7SUFEQyxJQUFBLGVBQU0sR0FBRTs7c0VBQ3FCO0FBRTlCO0lBREMsSUFBQSxlQUFNLEdBQUU7OzBEQUM2QjtBQUV0QztJQURDLElBQUEsZUFBTSxHQUFFOzt5RUFDcUU7QUFFOUU7SUFEQyxJQUFBLGVBQU0sR0FBRTs7a0VBQ3dFO0FBakJ4RSxlQUFlO0lBRDNCLElBQUEsZ0JBQU8sRUFBQyxpQkFBaUIsQ0FBQztHQUNkLGVBQWUsQ0EwZDNCO0FBMWRZLDBDQUFlIn0=