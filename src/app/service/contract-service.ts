import * as  mongoose from 'mongoose';
import {isString, assign, isNumber, differenceWith} from 'lodash';
import {provide, inject} from 'midway';
import {ArgumentError} from 'egg-freelog-base';
import {
    ContractInfo, BeSignSubjectOptions, IContractService, IOutsideApiService
} from '../../interface';
import {ContractEventEnum, ContractFsmRunningStatusEnum, ContractType, SubjectType} from '../../enum';

@provide('contractService')
export class ContractService implements IContractService {

    @inject()
    ctx;
    @inject()
    contractInfoProvider;
    @inject()
    contractPolicyInfoProvider;
    @inject()
    contractChangedHistoryProvider;
    @inject()
    outsideApiService: IOutsideApiService;
    @inject()
    contractInfoSignatureProvider;
    @inject()
    contractEventHandler;

    /**
     * 批量签约
     * @param {BeSignSubjectOptions[]} subjects
     * @param {string | number} licenseeId
     * @param {ContractType} contractType
     * @returns {Promise<ContractInfo[]>}
     */
    async batchSignSubjects(subjects: BeSignSubjectOptions[], licenseeId: string | number, contractType: ContractType, subjectType: SubjectType): Promise<ContractInfo[]> {

        const subjectMap: Map<string, any> = new Map(subjects.map(x => [x.subjectId, {policyId: x.policyId}]));
        const contractUniqueKeys = subjects.map(subject =>
            this.contractInfoSignatureProvider.contractBaseInfoUniqueKeyGenerate(assign({
                licenseeId, status: 0
            }, subject)));

        // 已经签约并且生效中的合约(生效中:未终止的或者系统判定异常的)
        const hasSignedAndEfficientContracts = await this.find({uniqueKey: {$in: contractUniqueKeys}});
        const beSignSubjects = differenceWith(subjects, hasSignedAndEfficientContracts, (x, y: ContractInfo) => {
            return x.subjectId === y.subjectId && x.subjectType === y.subjectType && x.policyId === y.policyId;
        });

        const {licenseeName, licenseeOwnerId, licenseeOwnerName} = await this.outsideApiService.getLicenseeInfo(licenseeId, contractType);
        const beSignSubjectList = await this.outsideApiService.getSubjectInfos(beSignSubjects.map(x => x.subjectId), subjectType);

        const invalidPolicyIds = [];
        const beSignContracts = beSignSubjectList.map(subjectInfo => {
            const beSignSubject = subjectMap.get(subjectInfo.subjectId);
            const {licensorId, licensorName, licensorOwnerId, policies, licensorOwnerName, subjectId, subjectName, subjectType} = subjectInfo;
            const policyInfo = policies.find(x => x.policyId === beSignSubject.policyId);
            if (!policyInfo || policyInfo.status !== 1) {
                invalidPolicyIds.push(beSignSubject.policyId);
                return;
            }
            const contract: ContractInfo = {
                licensorId, licensorName, licensorOwnerId, licensorOwnerName,
                licenseeId, licenseeName, licenseeOwnerId, licenseeOwnerName,
                subjectId, subjectName, subjectType, contractType, policyInfo,
                contractId: mongoose.Types.ObjectId,
                contractName: policyInfo.policyName,
                policyId: policyInfo.policyId,
                status: 0, authStatus: 1,
                fsmCurrentState: null,
                fsmRunningStatus: ContractFsmRunningStatusEnum.Uninitialized
            };
            contract.signature = this.contractInfoSignatureProvider.contractBaseInfoSignature(contract);
            contract.uniqueKey = this.contractInfoSignatureProvider.contractBaseInfoUniqueKeyGenerate(contract);
            return contract;
        });

        return beSignContracts;
    }

    /**
     * 签约标的物
     * @param {CreateContractOptions} options
     * @param {string | number} licenseeId
     * @param {ContractType} contractType
     * @returns {Promise<ContractInfo>}
     */
    async signSubject(options: BeSignSubjectOptions, licenseeId: string | number, contractType: ContractType, sortId?: number): Promise<ContractInfo> {

        const licenseeInfo = await this.outsideApiService.getLicenseeInfo(licenseeId, contractType);
        const subjectBaseInfo = await this.outsideApiService.getSubjectInfo(options.subjectId, options.subjectType);

        const policyInfo = subjectBaseInfo.policies.find(x => x.policyId === options.policyId);
        if (!policyInfo || policyInfo.status !== 1) {
            throw new ArgumentError(this.ctx.gettext('subject-policy-check-failed'));
        }

        const contract: ContractInfo = {
            contractType,
            contractId: mongoose.Types.ObjectId,
            contractName: policyInfo.policyName,
            licensorId: subjectBaseInfo.licensorId,
            licensorName: subjectBaseInfo.licensorName,
            licensorOwnerId: subjectBaseInfo.licensorOwnerId,
            licensorOwnerName: subjectBaseInfo.licensorOwnerName,
            licenseeId: licenseeInfo.licenseeId,
            licenseeName: licenseeInfo.licenseeName,
            licenseeOwnerId: licenseeInfo.licenseeOwnerId,
            licenseeOwnerName: licenseeInfo.licenseeOwnerName,
            subjectId: subjectBaseInfo.subjectId,
            subjectName: subjectBaseInfo.subjectName,
            subjectType: subjectBaseInfo.subjectType,
            policyId: policyInfo.policyId,
            sortId: isNumber(sortId) ? sortId : 1,
            status: 0, authStatus: 1,
        };

        contract.uniqueKey = this.contractInfoSignatureProvider.contractBaseInfoUniqueKeyGenerate(contract);

        const existingContract = await this.findOne({uniqueKey: contract.uniqueKey});
        if (existingContract) {
            return existingContract;
        }

        contract.signature = this.contractInfoSignatureProvider.contractBaseInfoSignature(contract);
        contract.contractPolicyInfo = this.contractPolicyInfoProvider.findOne({policyId: contract.policyId});

        return this.contractInfoProvider.create(contract).tap(model => this.contractEventHandler.emitContractEvent(ContractEventEnum.InitialContractFsmEvent, model));
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
        if (isNumber(options.sortIndex)) {
            model.sortIndex = options.sortIndex;
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
        if (isString(options.fsmCurrentState)) {
            model.fsmCurrentState = options.fsmCurrentState;
        }
        if (!Object.keys(model).length) {
            throw new ArgumentError('params is invalid');
        }
        return this.contractInfoProvider.updateOne({_id: contract.contractId}, model).then(data => Boolean(data.ok));
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

    async findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<ContractInfo[]> {
        return this.contractInfoProvider.findPageList(condition, page, pageSize, projection.join(' '), orderBy);
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
        }).catch(console.error).then(console.log);
    }
}
