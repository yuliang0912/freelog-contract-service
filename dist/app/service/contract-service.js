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
        const invalidPolicyIds = [];
        const beSignContracts = beSignSubjects.map(beSignSubject => {
            const subjectInfo = beSignSubjectMap.get(beSignSubject.subjectId);
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
        if (!lodash_1.isEmpty(invalidPolicyIds)) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('subject-policy-check-failed'), invalidPolicyIds);
        }
        // console.log('DB写入参数' + beSignContracts.map(x => x.policyId).toString());
        const latestSignedContracts = await this.contractInfoProvider.insertMany(beSignContracts);
        // console.log('DB返回数据' + JSON.stringify(latestSignedContracts));
        this.contractEventHandler.handle(enum_1.ContractEventEnum.InitialContractFsmEvent, latestSignedContracts).then();
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
    async addContractChangedHistory(contract, fromState, toState, event, triggerDate) {
        const fsmStateTransitionInfo = {
            fromState, toState, event, triggerDate
        };
        await this.contractChangedHistoryProvider.create({
            contractId: contract.contractId,
            histories: [fsmStateTransitionInfo]
        });
        return this.contractChangedHistoryProvider.findOneAndUpdate({ contractId: contract.contractId }, {
            $addToSet: { histories: fsmStateTransitionInfo },
        }, { new: true }).then(changeHistory => {
            return changeHistory || this.contractChangedHistoryProvider.create({
                contractId: contract.contractId,
                histories: [fsmStateTransitionInfo]
            });
        });
    }
    async addContractChangedHistoryAndLockFsmRunningStatus(contract, fromState, toState, event, triggerDate) {
        const fsmStateTransitionInfo = {
            fromState, toState, event, triggerDate
        };
        const existingHistoryInfo = await this.contractChangedHistoryProvider.findOne({ contractId: contract.contractId }, { histories: { $slice: -1 } });
        if (existingHistoryInfo && !lodash_1.isEmpty(existingHistoryInfo.histories)) {
            const latestEventRecord = lodash_1.first(existingHistoryInfo.histories);
            // 逻辑上事件历史记录必须能够按状态机的事件接受顺序串联起来
            if (latestEventRecord.toState !== fsmStateTransitionInfo.fromState) {
                throw new egg_freelog_base_1.LogicError(`please check contract event,add contract event history failed.contractId:${contract.contractId},eventId:${event}`);
            }
        }
        if (existingHistoryInfo) {
            await this.contractChangedHistoryProvider.updateOne({
                contractId: contract.contractId
            }, { $push: { histories: fsmStateTransitionInfo } });
        }
        else {
            await this.contractChangedHistoryProvider.create({
                contractId: contract.contractId,
                histories: [fsmStateTransitionInfo]
            });
        }
        return this.contractInfoProvider.updateOne({ _id: contract.contractId }, { fsmRunningStatus: enum_1.ContractFsmRunningStatusEnum.Locked });
    }
    /**
     * 给资源填充策略详情信息
     * @param resources
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
], ContractService.prototype, "contractChangedHistoryProvider", void 0);
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
    __metadata("design:type", Object)
], ContractService.prototype, "contractEventHandler", void 0);
ContractService = __decorate([
    midway_1.provide('contractService')
], ContractService);
exports.ContractService = ContractService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3Qtc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9jb250cmFjdC1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUF3RjtBQUN4RixtQ0FBK0M7QUFLL0MscUNBQW1HO0FBQ25HLHVEQUcwQjtBQUcxQixJQUFhLGVBQWUsR0FBNUIsTUFBYSxlQUFlO0lBbUJ4Qjs7Ozs7O09BTUc7SUFDSCxLQUFLLENBQUMsaUJBQWlCLENBQUMsUUFBZ0MsRUFBRSxVQUEyQixFQUFFLG9CQUFzRCxFQUFFLFdBQTRCO1FBRXZLLDJFQUEyRTtRQUUzRSxNQUFNLGtCQUFrQixHQUFHLE1BQU0sSUFBSSxDQUFDLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUM7WUFDNUYsV0FBVyxFQUFFLFVBQVU7WUFDdkIsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTO1lBQzVCLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTtZQUMxQixNQUFNLEVBQUUscUNBQWtCLENBQUMsUUFBUTtTQUN0QyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRUwsTUFBTSxjQUFjLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3JFLG1GQUFtRjtRQUNuRix1Q0FBdUM7UUFDdkMsTUFBTSw4QkFBOEIsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNySCxvR0FBb0c7UUFDcEcsSUFBSSxnQkFBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQ3pCLE9BQU8s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