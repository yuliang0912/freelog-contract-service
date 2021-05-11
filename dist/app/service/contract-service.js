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
        if (isWaitInitial) {
            await this._initialContracts(latestSignedContracts, beSignSubjectPolicyMap).catch();
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
        return this.contractInfoProvider.findIntervalList(condition, skip, limit, projection?.join(' '), sort);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3Qtc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9jb250cmFjdC1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUFpRjtBQUNqRixtQ0FBK0M7QUFVL0MscUNBQWdGO0FBQ2hGLHVEQUcwQjtBQUcxQixJQUFhLGVBQWUsR0FBNUIsTUFBYSxlQUFlO0lBaUJ4Qjs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxhQUFxQixFQUFFLFFBQWdCLEVBQUUsVUFBa0I7UUFDdkYsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztnQkFDNUMsU0FBUyxFQUFFLGFBQWEsRUFBRSxRQUFRO2FBQ3JDLENBQUMsRUFBRSxVQUFVLEVBQUUsbURBQWdDLENBQUMsVUFBVSxFQUFFLGtDQUFlLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hHLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBRSxFQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQzFGLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxLQUFLLENBQUMsaUJBQWlCLENBQUMsUUFBZ0MsRUFBRSxVQUEyQixFQUFFLG9CQUFzRCxFQUFFLFdBQTRCLEVBQUUsYUFBYSxHQUFHLEtBQUs7UUFFOUwsMkVBQTJFO1FBQzNFLE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUM1RixXQUFXLEVBQUUsVUFBVTtZQUN2QixTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVM7WUFDNUIsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRO1lBQzFCLE1BQU0sRUFBRSxxQ0FBa0IsQ0FBQyxRQUFRO1NBQ3RDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFTCxNQUFNLGNBQWMsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDckUsbUZBQW1GO1FBQ25GLHVDQUF1QztRQUN2QyxNQUFNLDhCQUE4QixHQUFHLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3JILG9HQUFvRztRQUNwRyxJQUFJLGdCQUFPLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDekIsT0FBTyw4QkFBOEIsQ0FBQztTQUN6QztRQUVELE1BQU0sRUFBQyxZQUFZLEVBQUUsZUFBZSxFQUFFLGlCQUFpQixFQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBQzFJLE1BQU0sZ0JBQWdCLEdBQWlDLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMvSixPQUFPLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BELENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxzQkFBc0IsR0FBNEIsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0TCxNQUFNLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztRQUM3QixNQUFNLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztRQUM1QixNQUFNLGVBQWUsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQ3ZELE1BQU0sV0FBVyxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEUsSUFBSSxXQUFXLEVBQUUsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDM0IsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDOUMsT0FBTzthQUNWO1lBQ0QsTUFBTSxFQUFDLFVBQVUsRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBQyxHQUFHLFdBQVcsQ0FBQztZQUNsSSxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxLQUFLLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNwRixJQUFJLENBQUMsaUJBQWlCLElBQUksaUJBQWlCLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQzdHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxhQUFhLENBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQztnQkFDOUYsT0FBTzthQUNWO1lBQ0QsTUFBTSxRQUFRLEdBQWlCO2dCQUMzQixVQUFVLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxpQkFBaUI7Z0JBQzVELFVBQVUsRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLGlCQUFpQixFQUFFLG9CQUFvQjtnQkFDbEYsU0FBUyxFQUFFLFdBQVcsRUFBRSxXQUFXO2dCQUNuQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUU7Z0JBQzFDLFlBQVksRUFBRSxpQkFBaUIsQ0FBQyxVQUFVO2dCQUMxQyxRQUFRLEVBQUUsaUJBQWlCLENBQUMsUUFBUTtnQkFDcEMsZUFBZSxFQUFFLEVBQUU7Z0JBQ25CLFVBQVUsRUFBRSw2QkFBc0IsQ0FBQyxZQUFZO2dCQUMvQyxNQUFNLEVBQUUscUNBQWtCLENBQUMsUUFBUTtnQkFDbkMsZ0JBQWdCLEVBQUUsbUNBQTRCLENBQUMsYUFBYTtnQkFDNUQsVUFBVSxFQUFFLElBQUksSUFBSSxFQUFFO2FBQ3pCLENBQUM7WUFDRixRQUFRLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM1RixRQUFRLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxpQ0FBaUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNwRyxPQUFPLFFBQVEsQ0FBQztRQUNwQixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxnQkFBTyxDQUFDLGlCQUFpQixDQUFDLEVBQUU7WUFDN0IsTUFBTSxJQUFJLG1DQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLDRCQUE0QixFQUFFLFFBQVEsQ0FBQyxFQUFFLGdCQUFnQixDQUFDLENBQUM7U0FDMUc7UUFDRCxJQUFJLENBQUMsZ0JBQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1lBQzVCLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxFQUFFLGdCQUFnQixDQUFDLENBQUM7U0FDakc7UUFFRCxNQUFNLHFCQUFxQixHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUUxRixJQUFJLGFBQWEsRUFBRTtZQUNmLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLHFCQUFxQixFQUFFLHNCQUFzQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDdkY7YUFBTTtZQUNILElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxxQkFBcUIsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ2pGO1FBRUQsT0FBTyxDQUFDLEdBQUcscUJBQXFCLEVBQUUsR0FBRyw4QkFBOEIsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxRQUFzQixFQUFFLE9BQVk7UUFDekQsTUFBTSxLQUFLLEdBQVEsRUFBRSxDQUFDO1FBQ3RCLElBQUksaUJBQVEsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDaEMsS0FBSyxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDO1NBQzdDO1FBQ0QsSUFBSSxpQkFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUMxQixLQUFLLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7U0FDakM7UUFDRCxJQUFJLGlCQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzlCLEtBQUssQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztTQUN6QztRQUNELElBQUksaUJBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDMUIsS0FBSyxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1NBQ3JDO1FBQ0QsSUFBSSxpQkFBUSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1lBQ3BDLEtBQUssQ0FBQyxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7U0FDckQ7UUFDRCxJQUFJLGlCQUFRLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFO1lBQ3JFLEtBQUssQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQztTQUNuRDtRQUNELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRTtZQUM1QixNQUFNLElBQUksZ0NBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1NBQ2hEO1FBQ0QsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLEVBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxVQUFVLEVBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDakgsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsc0JBQXNCLENBQUMsUUFBc0I7UUFFL0MsSUFBSSxRQUFRLENBQUMsb0JBQW9CLEtBQUssbURBQWdDLENBQUMsVUFBVSxFQUFFO1lBQy9FLE1BQU0sSUFBSSw2QkFBVSxDQUFDLDJCQUEyQixDQUFDLENBQUM7U0FDckQ7UUFFRCxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsYUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLFdBQVcsRUFBRSxhQUFhLEVBQUUsWUFBWSxDQUFDLENBQUMsRUFBRSxFQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBRXBILE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxFQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsVUFBVSxFQUFDLEVBQUUsRUFBQyxNQUFNLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDdkgsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBaUIsRUFBRSxHQUFHLElBQUk7UUFDcEMsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFRCxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQWtCLEVBQUUsR0FBRyxJQUFJO1FBQ3RDLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFpQixFQUFFLEdBQUcsSUFBSTtRQUNqQyxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBcUIsRUFBRSxHQUFHLElBQUk7UUFDMUMsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEVBQUMsR0FBRyxFQUFFLEVBQUMsR0FBRyxFQUFFLFdBQVcsRUFBQyxFQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUM5RSxDQUFDO0lBRUQsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFNBQWlCLEVBQUUsSUFBYSxFQUFFLEtBQWMsRUFBRSxVQUFxQixFQUFFLElBQWE7UUFDekcsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMzRyxDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFpQjtRQUN6QixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUdEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxTQUF5QjtRQUNsRCxJQUFJLENBQUMsZ0JBQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxnQkFBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzNDLE9BQU8sU0FBUyxDQUFDO1NBQ3BCO1FBQ0QsTUFBTSxTQUFTLEdBQUcsY0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGlCQUFRLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzFHLElBQUksZ0JBQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNwQixPQUFPLFNBQVMsQ0FBQztTQUNwQjtRQUNELE1BQU0sU0FBUyxHQUE0QixNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxtREFBbUQsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN0SixPQUFPLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBUyxFQUFFLEVBQUU7WUFDL0IsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDNUQsWUFBWSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDckUsT0FBTyxZQUFZLENBQUM7UUFDeEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxnQkFBMEIsRUFBRSxvQkFBc0Q7UUFDM0csT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDO1lBQ3ZDO2dCQUNJLE1BQU0sRUFBRSxFQUFDLGVBQWUsRUFBRSxFQUFDLEdBQUcsRUFBRSxnQkFBZ0IsRUFBQyxFQUFFLG9CQUFvQixFQUFDO2FBQzNFO1lBQ0Q7Z0JBQ0ksTUFBTSxFQUFFLEVBQUMsR0FBRyxFQUFFLGtCQUFrQixFQUFFLEtBQUssRUFBRSxFQUFDLElBQUksRUFBRSxDQUFDLEVBQUMsRUFBQzthQUN0RDtZQUNEO2dCQUNJLFFBQVEsRUFBRSxFQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsZUFBZSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFDO2FBQy9EO1NBQ0osQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsMEJBQTBCLENBQUMsU0FBeUo7UUFFdEwsTUFBTSxrQkFBa0IsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ2hELFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsNkJBQTZCLENBQUMsaUNBQWlDLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdkcsT0FBTyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLDhCQUE4QixHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFDLFNBQVMsRUFBRSxFQUFDLEdBQUcsRUFBRSxrQkFBa0IsRUFBQyxFQUFDLENBQUMsQ0FBQztRQUUvRixPQUFPLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDNUIsTUFBTSxnQkFBZ0IsR0FBRyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLFdBQVcsS0FBSyxRQUFRLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxLQUFLLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNsUCxPQUFPLGVBQU0sQ0FBQyxRQUFRLEVBQUU7Z0JBQ3BCLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztnQkFDdkMsa0JBQWtCLEVBQUUsZ0JBQWdCO2FBQ3ZDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsaUJBQWlCLENBQUMsU0FBeUIsRUFBRSxnQkFBeUM7UUFDeEYsSUFBSTtZQUNBLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFO2dCQUNwQixPQUFPO2FBQ1Y7WUFDRCxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDbkQsT0FBTyxPQUFPLENBQUMsZUFBZSxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUN0QyxLQUFLLE1BQU0sUUFBUSxJQUFJLFNBQVMsRUFBRTtvQkFDOUIsUUFBUSxDQUFDLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUM5RCxNQUFNLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQ3ZFO1lBQ0wsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1NBQ2xEO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWiw0QkFBNEI7U0FDL0I7SUFDTCxDQUFDO0NBQ0osQ0FBQTtBQTNRRztJQURDLGVBQU0sRUFBRTs7aURBQ0E7QUFFVDtJQURDLGVBQU0sRUFBRTs7NENBQ1c7QUFFcEI7SUFEQyxlQUFNLEVBQUU7OzZEQUM2QztBQUV0RDtJQURDLGVBQU0sRUFBRTs7c0RBQ3FCO0FBRTlCO0lBREMsZUFBTSxFQUFFOztzRUFDcUI7QUFFOUI7SUFEQyxlQUFNLEVBQUU7OzBEQUM2QjtBQUV0QztJQURDLGVBQU0sRUFBRTs7a0VBQ3dFO0FBZnhFLGVBQWU7SUFEM0IsZ0JBQU8sQ0FBQyxpQkFBaUIsQ0FBQztHQUNkLGVBQWUsQ0E4UTNCO0FBOVFZLDBDQUFlIn0=