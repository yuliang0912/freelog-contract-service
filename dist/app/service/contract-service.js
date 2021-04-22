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
    /**
     * 批量签约标的物
     * @param subjects
     * @param licenseeId
     * @param licenseeIdentityType
     * @param subjectType
     */
    async batchSignSubjects(subjects, licenseeId, licenseeIdentityType, subjectType) {
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
        if (lodash_1.isEmpty(beSignSubjects)) {
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
        if (!lodash_1.isEmpty(invalidSubjectIds)) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('sign-subject-invalid-error', '标的物不可用'), invalidPolicyIds);
        }
        if (!lodash_1.isEmpty(invalidPolicyIds)) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('subject-policy-check-failed'), invalidPolicyIds);
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
    async updateContractInfo(contract, options) {
        const model = {};
        if (lodash_1.isString(options.contractName)) {
            model.contractName = options.contractName;
        }
        if (lodash_1.isNumber(options.sortId)) {
            model.sortId = options.sortId;
        }
        if (lodash_1.isNumber(options.authStatus)) {
            model.authStatus = options.authStatus;
        }
        if (lodash_1.isNumber(options.status)) {
            model.authStatus = options.status;
        }
        if (lodash_1.isNumber(options.fsmRunningStatus)) {
            model.fsmRunningStatus = options.fsmRunningStatus;
        }
        if (lodash_1.isString(options.fsmCurrentState) && options.fsmCurrentState.length) {
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
        await this.contractInfoProvider.updateMany(lodash_1.pick(contract, ['subjectId', 'subjectType', 'licenseeId']), { sortId: 0 });
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
        return this.contractInfoProvider.findIntervalList(condition, skip, limit, projection?.toString(), sort);
    }
    async count(condition) {
        return this.contractInfoProvider.count(condition);
    }
    /**
     * 给资源填充策略详情信息
     * @param contracts
     */
    async fillContractPolicyInfo(contracts) {
        if (!lodash_1.isArray(contracts) || lodash_1.isEmpty(contracts)) {
            return contracts;
        }
        const policyIds = lodash_1.chain(contracts).filter(x => lodash_1.isString(x?.policyId)).map(x => x.policyId).uniq().value();
        if (lodash_1.isEmpty(policyIds)) {
            return contracts;
        }
        const policyMap = await this.policyService.findByIds(policyIds, 'policyId policyName policyText fsmDescriptionInfo').then(list => {
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
            return lodash_1.assign(baseInfo, {
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
    async _initialContracts(contracts, subjectPolicyMap) {
        try {
            if (!contracts?.length) {
                return;
            }
            const session = await this.mongoose.startSession();
            return session.withTransaction(async () => {
                for (const contract of contracts) {
                    contract.policyInfo = subjectPolicyMap.get(contract.policyId);
                    await this.buildContractStateMachine(contract).execInitial(session);
                }
            }).catch().finally(() => session.endSession());
        }
        catch (error) {
            // 错误不用处理,后续有job会定期检查未初始化的合约
        }
    }
};
__decorate([
    midway_1.plugin(),
    __metadata("design:type", Object)
], ContractService.prototype, "mongoose", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractService.prototype, "ctx", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractService.prototype, "contractInfoProvider", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractService.prototype, "policyService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractService.prototype, "contractInfoSignatureProvider", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ContractService.prototype, "outsideApiService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Function)
], ContractService.prototype, "buildContractStateMachine", void 0);
ContractService = __decorate([
    midway_1.provide('contractService')
], ContractService);
exports.ContractService = ContractService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3Qtc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9jb250cmFjdC1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUFpRjtBQUNqRixtQ0FBK0M7QUFVL0MscUNBQWdGO0FBQ2hGLHVEQUcwQjtBQUcxQixJQUFhLGVBQWUsR0FBNUIsTUFBYSxlQUFlO0lBaUJ4Qjs7Ozs7O09BTUc7SUFDSCxLQUFLLENBQUMsaUJBQWlCLENBQUMsUUFBZ0MsRUFBRSxVQUEyQixFQUFFLG9CQUFzRCxFQUFFLFdBQTRCO1FBRXZLLDJFQUEyRTtRQUMzRSxNQUFNLGtCQUFrQixHQUFHLE1BQU0sSUFBSSxDQUFDLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUM7WUFDNUYsV0FBVyxFQUFFLFVBQVU7WUFDdkIsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTO1lBQzVCLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTtZQUMxQixNQUFNLEVBQUUscUNBQWtCLENBQUMsUUFBUTtTQUN0QyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRUwsTUFBTSxjQUFjLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3JFLG1GQUFtRjtRQUNuRix1Q0FBdUM7UUFDdkMsTUFBTSw4QkFBOEIsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNySCxvR0FBb0c7UUFDcEcsSUFBSSxnQkFBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQ3pCLE9BQU8s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