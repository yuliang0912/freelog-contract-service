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
            policyId: subject.policyId,
            status: egg_freelog_base_1.ContractStatusEnum.Executed
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
            // 5秒之后再初始化,给其他服务预留足够的数据处理时间. 因为初始化之后会发生合约状态变更. 也会产生对应的mq消息.
            setTimeout(() => this._initialContracts(latestSignedContracts, beSignSubjectPolicyMap).catch(), 5000);
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
        const policyMap = await this.policyService.findByIds(policyIds, 'policyId policyName policyText fsmDescriptionInfo').then(list => {
            if (isTranslate) {
                list = this.policyService.policyTranslate(list, true);
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
     * 获取标的物签约次数(同一个用户去重)
     * @param subjectType
     * @param subjectIds
     */
    async findSubjectSignCounts(subjectType, subjectIds) {
        const aggregates = [{
                $match: {
                    subjectId: { $in: subjectIds }, subjectType
                }
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
        if (!subjectType) {
            delete aggregates[0].$match.subjectType;
        }
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
            const existingContract = hasSignedAndEfficientContracts.find(x => x.subjectId === baseInfo.subjectId && x.subjectType === baseInfo.subjectType && x.policyId === baseInfo.policyId && x.licenseeId.toString() === baseInfo.licenseeId.toString());
            return (0, lodash_1.assign)(baseInfo, {
                isCanReSign: !Boolean(existingContract),
                signedContractInfo: existingContract
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3Qtc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9jb250cmFjdC1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUFpRjtBQUNqRixtQ0FBK0M7QUFZL0MscUNBQWdGO0FBQ2hGLHVEQVUwQjtBQUcxQixJQUFhLGVBQWUsR0FBNUIsTUFBYSxlQUFlO0lBR3hCLFFBQVEsQ0FBQztJQUVULEdBQUcsQ0FBaUI7SUFFcEIsb0JBQW9CLENBQWtDO0lBRXRELGFBQWEsQ0FBaUI7SUFFOUIsNkJBQTZCLENBQUM7SUFFOUIsaUJBQWlCLENBQXFCO0lBRXRDLGdDQUFnQyxDQUE4QztJQUU5RSx5QkFBeUIsQ0FBd0Q7SUFFakY7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFrQixFQUFFLGVBQWUsR0FBRyxLQUFLO1FBQzlELE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxFQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUMsQ0FBQyxDQUFDO1FBQ2hGLElBQUksZUFBZSxFQUFFO1lBQ2pCLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztTQUNyRDtRQUNELE9BQU8sWUFBWSxDQUFDO0lBQ3hCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLGlCQUFpQixDQUFDLFdBQXFCLEVBQUUsZUFBZSxHQUFHLEtBQUs7UUFDbEUsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEVBQUMsR0FBRyxFQUFFLEVBQUMsR0FBRyxFQUFFLFdBQVcsRUFBQyxFQUFDLENBQUMsQ0FBQztRQUNsRixJQUFJLGVBQWUsRUFBRTtZQUNqQixNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsQ0FB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