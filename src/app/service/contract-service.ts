import * as  mongoose from 'mongoose';
import {isString, pick, first, isEmpty, assign, isNumber} from 'lodash';
import {provide, inject} from 'midway';
import {ArgumentError, LogicError} from 'egg-freelog-base';
import {ContractInfo, BeSignSubjectOptions, IContractService, IOutsideApiService} from '../../interface';
import {
    ContractAuthStatusEnum, ContractEventEnum,
    ContractFsmRunningStatusEnum, ContractStatusEnum,
    ContractType, SubjectType
} from '../../enum';

@provide('contractService')
export class ContractService implements IContractService {

    @inject()
    ctx;
    @inject()
    contractEventHandler;
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

    /**
     * 批量签约标的物
     * @param {BeSignSubjectOptions[]} subjects
     * @param {string | number} licenseeId
     * @param {ContractType} contractType
     * @returns {Promise<ContractInfo[]>}
     */
    async batchSignSubjects(subjects: BeSignSubjectOptions[], licenseeId: string | number, contractType: ContractType, subjectType: SubjectType): Promise<ContractInfo[]> {

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

        const {licenseeName, licenseeOwnerId, licenseeOwnerName} = await this.outsideApiService.getLicenseeInfo(licenseeId, contractType);
        const beSignSubjectList = await this.outsideApiService.getSubjectInfos(beSignSubjects.map(x => x.subjectId), subjectType);

        const invalidPolicyIds = [];
        const beSignContracts = beSignSubjectList.map(subjectInfo => {
            const beSignSubject = subjectMap.get(subjectInfo.subjectId);
            const {licensorId, licensorName, licensorOwnerId, policies, licensorOwnerName, subjectId, subjectName, subjectType} = subjectInfo;
            const subjectPolicyInfo = policies.find(x => x.policyId === beSignSubject.policyId);
            if (!subjectPolicyInfo || subjectPolicyInfo.status !== 1) {
                invalidPolicyIds.push(beSignSubject.policyId);
                return;
            }
            const contract: ContractInfo = {
                licensorId, licensorName, licensorOwnerId, licensorOwnerName,
                licenseeId, licenseeName, licenseeOwnerId, licenseeOwnerName,
                subjectId, subjectName, subjectType, contractType,
                contractId: mongoose.Types.ObjectId,
                contractName: subjectPolicyInfo.policyName,
                policyId: subjectPolicyInfo.policyId,
                fsmCurrentState: 'none',
                authStatus: ContractAuthStatusEnum.Unknown,
                status: ContractStatusEnum.Executed,
                fsmRunningStatus: ContractFsmRunningStatusEnum.Uninitialized,
                createDate: new Date()
            };
            contract.signature = this.contractInfoSignatureProvider.contractBaseInfoSignature(contract);
            contract.uniqueKey = this.contractInfoSignatureProvider.contractBaseInfoUniqueKeyGenerate(contract);
            return contract;
        });

        const latestSignedContracts = await this.contractInfoProvider.insertMany(beSignContracts);

        this.contractEventHandler.emitContractEvent(ContractEventEnum.InitialContractFsmEvent, latestSignedContracts).then();

        return [...latestSignedContracts, ...hasSignedAndEfficientContracts];
    }

    /**
     * 签约标的物
     * @param {CreateContractOptions} options
     * @param {string | number} licenseeId
     * @param {ContractType} contractType
     * @returns {Promise<ContractInfo>}
     */
    async signSubject(options: BeSignSubjectOptions, licenseeId: string | number, contractType: ContractType, sortId?: number): Promise<ContractInfo> {

        return this.batchSignSubjects([options], licenseeId, contractType, options.subjectType).then(list => first(list));
        //
        // const {isCanReSign, uniqueKey, signedContractInfo} = await this._checkIsCanReSignContract({
        //     subjectId: options.subjectId,
        //     subjectType: options.subjectType,
        //     policyId: options.policyId,
        //     status: ContractStatusEnum.Executed,
        //     licenseeId
        // });
        // if (!isCanReSign) {
        //     return signedContractInfo;
        // }
        //
        // const licenseeInfo = await this.outsideApiService.getLicenseeInfo(licenseeId, contractType);
        // const subjectBaseInfo = await this.outsideApiService.getSubjectInfo(options.subjectId, options.subjectType);
        //
        // // 策略目前专门存放在独立的策略库中.标的物属性中只记录策略ID以及自定义策略名称和启用状态
        // const subjectPolicyInfo = subjectBaseInfo.policies.find(x => x.policyId === options.policyId);
        // if (!subjectPolicyInfo || subjectPolicyInfo.status !== 1) {
        //     throw new ArgumentError(this.ctx.gettext('subject-policy-check-failed'));
        // }
        // const contractPolicyInfo = await this.contractPolicyInfoProvider.findOne({policyId: subjectPolicyInfo.policyId});
        //
        // const {licenseeName, licenseeOwnerId, licenseeOwnerName} = licenseeInfo;
        // const {licensorId, licensorName, licensorOwnerId, licensorOwnerName, subjectId, subjectName, subjectType} = subjectBaseInfo;
        //
        // const contract: ContractInfo = {
        //     licensorId, licensorName, licensorOwnerId, licensorOwnerName,
        //     licenseeId, licenseeName, licenseeOwnerId, licenseeOwnerName,
        //     subjectId, subjectName, subjectType, contractType, uniqueKey,
        //     contractId: mongoose.Types.ObjectId,
        //     contractName: subjectPolicyInfo.policyName,
        //     policyId: subjectPolicyInfo.policyId,
        //     sortId: isNumber(sortId) ? sortId : 1,
        //     fsmCurrentState: 'none',
        //     authStatus: ContractAuthStatusEnum.Unknown,
        //     status: ContractStatusEnum.Executed,
        //     fsmRunningStatus: ContractFsmRunningStatusEnum.Uninitialized,
        //     createDate: new Date()
        // };
        //
        // contract.signature = this.contractInfoSignatureProvider.contractBaseInfoSignature(contract);
        //
        // const latestSignedContractInfo = await this.contractInfoProvider.create(contract);
        //
        // // 后续优化,一般来说只有用户的合同需要马上初始化并且获得授权结果,其他类型的合同实时性要求并没有那么高.所以初始化体系可以设计优先级别
        // this.contractEventHandler.emitContractEvent(ContractEventEnum.InitialContractFsmEvent, latestSignedContractInfo, contractPolicyInfo).then();
        //
        // return latestSignedContractInfo;
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

    /**
     * 设置默认执行合同
     * @param {ContractInfo} contract
     * @returns {Promise<boolean>}
     */
    async setDefaultExecContract(contract: ContractInfo): Promise<boolean> {

        if (contract.contractType !== ContractType.UserToNode) {
            throw new LogicError('please check contractType');
        }

        await this.contractInfoProvider.updateMany(pick(contract, ['subjectId', 'subjectType', 'licenseeId', 'contractType']), {sortId: 0});

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
        });
    }

    async _checkIsCanReSignContract(baseInfo: { subjectId: string, subjectType: SubjectType, licenseeId: string | number, policyId: string, status: number, contractId?: string }): Promise<any> {
        return this._checkIsCanReSignContracts([baseInfo]).then(list => first(list));
    }

    /**
     * 检查合同是否可以重签
     * @param {Array<{subjectId: string; subjectType: SubjectType; licenseeId: string | number; policyId: string; status: number; contractId?: string}>} baseInfos
     * @returns {Promise<any>}
     * @private
     */
    async _checkIsCanReSignContracts(baseInfos: Array<{ subjectId: string, subjectType: SubjectType, licenseeId: string | number, policyId: string, status: number, contractId?: string }>): Promise<any[]> {

        const contractUniqueKeys = baseInfos.map(baseInfo => {
            baseInfo['uniqueKey'] = this.contractInfoSignatureProvider.contractBaseInfoUniqueKeyGenerate(baseInfo);
            return baseInfo['uniqueKey'];
        });
        const hasSignedAndEfficientContracts = await this.find({uniqueKey: {$in: contractUniqueKeys}});

        return baseInfos.map(baseInfo => {
            const existingContract = hasSignedAndEfficientContracts.find(x => x.subjectId === baseInfo.subjectId && x.subjectType === baseInfo.subjectType && x.policyId === baseInfo.policyId && x.licenseeId === baseInfo.licenseeId);
            return assign(baseInfo, {
                isCanReSign: !Boolean(existingContract),
                signedContractInfo: existingContract
            });
        });
    }
}
