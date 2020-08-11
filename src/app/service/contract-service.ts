import * as  mongoose from 'mongoose';
import {isString, pick, first, isEmpty, assign, isNumber} from 'lodash';
import {provide, inject} from 'midway';
import {ArgumentError, ApplicationError, LogicError} from 'egg-freelog-base';
import {
    ContractInfo,
    BeSignSubjectOptions,
    IContractService,
    IOutsideApiService,
    IContractEventHandler, IPolicyService, PolicyInfo, PageResult
} from '../../interface';
import {
    ContractAuthStatusEnum, ContractEventEnum,
    ContractFsmRunningStatusEnum, ContractStatusEnum,
    IdentityType, SubjectType
} from '../../enum';

@provide('contractService')
export class ContractService implements IContractService {

    @inject()
    ctx;
    @inject()
    contractInfoProvider;
    @inject()
    policyService: IPolicyService;
    @inject()
    contractChangedHistoryProvider;
    @inject()
    contractInfoSignatureProvider;
    @inject()
    outsideApiService: IOutsideApiService;
    @inject()
    contractEventHandler: IContractEventHandler;

    /**
     * 批量签约标的物
     * @param subjects
     * @param licenseeId
     * @param licenseeIdentityType
     * @param subjectType
     */
    async batchSignSubjects(subjects: BeSignSubjectOptions[], licenseeId: string | number, licenseeIdentityType: IdentityType, subjectType: SubjectType): Promise<ContractInfo[]> {

        const subjectMap: Map<string, any> = new Map(subjects.map(x => [x.subjectId, {policyId: x.policyId}]));

        const reSignCheckResults = await this._checkIsCanReSignContracts(subjects.map(subject => Object({
            subjectType, licenseeId,
            subjectId: subject.subjectId,
            policyId: subject.policyId,
            status: ContractStatusEnum.Executed
        })));

        const beSignSubjects = reSignCheckResults.filter(x => x.isCanReSign);
        // 已经签约并且生效中的合约不允许重签(生效中:未终止的或者系统判定异常的)
        const hasSignedAndEfficientContracts = reSignCheckResults.filter(x => !x.isCanReSign).map(x => x.signedContractInfo);
        if (isEmpty(beSignSubjects)) {
            return hasSignedAndEfficientContracts;
        }

        const {licenseeName, licenseeOwnerId, licenseeOwnerName} = await this.outsideApiService.getLicenseeInfo(licenseeId, licenseeIdentityType);
        const beSignSubjectList = await this.outsideApiService.getSubjectInfos(beSignSubjects.map(x => x.subjectId), subjectType);
        const beSignSubjectPolicyMap: Map<string, PolicyInfo> = await this.policyService.findByIds(beSignSubjects.map(x => x.policyId)).then(list => new Map(list.map(x => [x.policyId, x])));

        const invalidPolicyIds = [];
        const beSignContracts = beSignSubjectList.map(subjectInfo => {
            const beSignSubject = subjectMap.get(subjectInfo.subjectId);
            const {licensorId, licensorName, licensorOwnerId, policies, licensorOwnerName, subjectId, subjectName, subjectType} = subjectInfo;
            const subjectPolicyInfo = policies.find(x => x.policyId === beSignSubject.policyId);
            if (!subjectPolicyInfo || subjectPolicyInfo.status !== 1 || !beSignSubjectPolicyMap.has(beSignSubject.policyId)) {
                invalidPolicyIds.push({subjectId: subjectInfo.subjectId, policyId: beSignSubject.policyId});
                return;
            }
            const contract: ContractInfo = {
                licensorId, licensorName, licensorOwnerId, licensorOwnerName,
                licenseeId, licenseeName, licenseeOwnerId, licenseeOwnerName, licenseeIdentityType,
                subjectId, subjectName, subjectType,
                contractId: mongoose.Types.ObjectId,
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

        this.contractEventHandler.handle(ContractEventEnum.InitialContractFsmEvent, latestSignedContracts).then();

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

        if (contract.licenseeIdentityType !== IdentityType.ClientUser) {
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

    async findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<PageResult> {
        let dataList = [];
        const totalItem = await this.count(condition);
        if (totalItem > (page - 1) * pageSize) {
            dataList = await this.contractInfoProvider.findPageList(condition, page, pageSize, projection.join(' '), orderBy);
        }
        return {page, pageSize, totalItem, dataList};
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
        const existingHistoryInfo = await this.contractChangedHistoryProvider.findOne({contractId: contract.contractId}, {histories: {$slice: -1}});
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
        return this.contractInfoProvider.updateOne({_id: contract.contractId}, {fsmRunningStatus: ContractFsmRunningStatusEnum.Locked});
    }

    /**
     * 检查合同是否可以重签
     * @param baseInfos
     * @private
     */
    async _checkIsCanReSignContracts(baseInfos: Array<{ subjectId: string, subjectType: SubjectType, licenseeId: string | number, policyId: string, status: number, contractId?: string }>): Promise<any[]> {

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
}
