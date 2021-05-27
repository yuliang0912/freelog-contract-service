import {provide, inject, init} from 'midway';
import {ApplicationError, ContractLicenseeIdentityTypeEnum, FreelogContext, SubjectTypeEnum} from 'egg-freelog-base';
import {
    IOutsideApiService, LicenseeInfo, NodeInfo, SubjectBaseInfo, UserInfo, ResourceInfo, PresentableInfo
} from '../../interface';
import {differenceWith, isEmpty, uniq, isArray, first} from 'lodash';

@provide()
export class OutsideApiService implements IOutsideApiService {

    readonly subjectWrapMap: Map<SubjectTypeEnum, (subjectIds: string[]) => Promise<SubjectBaseInfo[]>> = new Map();
    readonly licenseeWrapMap: Map<number, (licenseeId: string | number) => Promise<LicenseeInfo>> = new Map();

    @inject()
    ctx: FreelogContext;

    /**
     * 合约支付
     * @param fromAccountId
     * @param toAccountId
     * @param transactionAmount
     * @param contractId
     * @param subjectType
     * @param contractName
     * @param eventId
     * @param password
     */
    async contractPayment(fromAccountId: string, toAccountId: string, transactionAmount: number, contractId: string, subjectType: number, contractName: string, eventId: string, password: string) {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.transactionInfoV2}/contracts/payment`, {
            method: 'post', contentType: 'json', data: {
                fromAccountId, toAccountId, transactionAmount, contractId, subjectType, contractName, eventId, password
            }
        });
    }

    /**
     * 查询交易记录信息
     * @param transactionRecordId
     */
    async getTransactionRecordInfo(transactionRecordId: string) {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.transactionInfoV2}/records/${transactionRecordId}`);
    }

    /**
     * 获取用户信息
     * @param {number} userId
     * @returns {Promise<UserInfo>}
     */
    async getUserInfo(userId: number): Promise<UserInfo> {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.userInfo}/${userId}`);
    }

    /**
     * 获取用户交易账号
     */
    async getIndividualTransactionAccounts(userId: number) {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.accountInfoV2}/individualAccounts/${userId}`);
    }

    /**
     * 获取节点信息
     * @param {number} nodeId
     * @returns {Promise<NodeInfo>}
     */
    async getNodeInfo(nodeId: number): Promise<NodeInfo> {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.nodeInfoV2}/${nodeId}`);
    }

    /**
     * 获取标的物信息
     * @param subjectId
     * @param subjectType
     */
    async getSubjectInfo(subjectId: string, subjectType: SubjectTypeEnum): Promise<SubjectBaseInfo> {
        if (!this.subjectWrapMap.has(subjectType)) {
            throw new ApplicationError(`please check code,not support subjectType:${subjectType}.`);
        }
        const subjectBaseInfos = await this.subjectWrapMap.get(subjectType).call(this, [subjectId]);
        return first(subjectBaseInfos);
    }

    /**
     * 批量获取标的物信息
     * @param subjectIds
     * @param subjectType
     */
    async getSubjectInfos(subjectIds: string[], subjectType: SubjectTypeEnum): Promise<SubjectBaseInfo[]> {
        if (!this.subjectWrapMap.has(subjectType)) {
            throw new ApplicationError(`please check code,not support subjectType:${subjectType}.`);
        }
        if (!isArray(subjectIds) || isEmpty(subjectIds)) {
            return [];
        }
        return this.subjectWrapMap.get(subjectType).call(this, uniq(subjectIds));
    }

    /**
     * 获取乙方信息
     * @param licenseeId
     * @param identityType
     */
    async getLicenseeInfo(licenseeId: string | number, identityType: ContractLicenseeIdentityTypeEnum): Promise<LicenseeInfo> {
        if (!this.licenseeWrapMap.has(identityType)) {
            throw new ApplicationError(`please check code, not support identityType:${identityType}.`);
        }
        return this.licenseeWrapMap.get(identityType).call(this, licenseeId);
    }

    /**
     * 资源信息转换为标的物基础信息
     * @param {string[]} resourceIds
     * @returns {Promise<SubjectBaseInfo[]>}
     * @private
     */
    async _resourceInfoWrapToSubjectBaseInfo(resourceIds: string[]): Promise<SubjectBaseInfo[]> {
        const resourceInfos: ResourceInfo[] = await this.ctx.curlIntranetApi(`${this.ctx.webApi.resourceInfoV2}/list?resourceIds=${resourceIds.toString()}&projection=resourceId,resourceName,userId,username,policies,status`);
        const invalidResourceIds = differenceWith(resourceIds, resourceInfos, (x, y) => x === y.resourceId);
        if (!isEmpty(invalidResourceIds)) {
            throw new ApplicationError(this.ctx.gettext('sign-subject-invalid-error', `,resourceId:[${invalidResourceIds.toString()}]`));
        }
        const offlineResourceIds = resourceInfos.filter(x => x.status !== 1).map(x => x.resourceId);
        if (!isEmpty(offlineResourceIds)) {
            throw new ApplicationError(this.ctx.gettext('sign-subject-offline-error', `,resourceId:[${offlineResourceIds.toString()}]`));
        }

        return resourceInfos.map((resourceInfo) => {
            return {
                subjectId: resourceInfo.resourceId,
                subjectType: SubjectTypeEnum.Resource,
                subjectName: resourceInfo.resourceName,
                licensorId: resourceInfo.resourceId,
                licensorName: resourceInfo.resourceName,
                licensorOwnerId: resourceInfo.userId,
                licensorOwnerName: resourceInfo.username,
                policies: resourceInfo.policies,
                status: resourceInfo.status === 1 ? 1 : 0, // 上架了才可以用
            };
        });
    }

    /**
     * 展品信息转换为标的物信息
     * @param {string[]} presentableIds
     * @returns {Promise<SubjectBaseInfo[]>}
     * @private
     */
    async _presentableWrapToSubjectBaseInfo(presentableIds: string[]): Promise<SubjectBaseInfo[]> {
        const presentableInfos: PresentableInfo[] = await this.ctx.curlIntranetApi(`${this.ctx.webApi.presentableInfoV2}/list?presentableIds=${presentableIds.toString()}&projection=presentableId,presentableName,policies,nodeId,onlineStatus`);
        const invalidPresentableIds = differenceWith(presentableIds, presentableInfos, (x, y) => x === y.presentableId);
        if (!isEmpty(invalidPresentableIds)) {
            throw new ApplicationError(this.ctx.gettext('sign-subject-invalid-error', `,presentableIds:[${invalidPresentableIds.toString()}]`));
        }
        const offlinePresentableIds = presentableInfos.filter(x => x.onlineStatus !== 1).map(x => x.presentableId);
        if (!isEmpty(offlinePresentableIds)) {
            throw new ApplicationError(this.ctx.gettext('sign-subject-offline-error', `,resourceId:[${offlinePresentableIds.toString()}]`));
        }
        const nodeInfoMap: Map<number, NodeInfo> = await this.ctx.curlIntranetApi(`${this.ctx.webApi.nodeInfoV2}/list?nodeIds=${presentableInfos.map(x => x.nodeId).toString()}`).then(list => {
            return new Map(list.map(x => [x.nodeId, x]));
        });

        return presentableInfos.map(presentableInfo => {
            const nodeInfo = nodeInfoMap.get(presentableInfo.nodeId);
            return {
                subjectId: presentableInfo.presentableId,
                subjectType: SubjectTypeEnum.Presentable,
                subjectName: presentableInfo.presentableName,
                licensorId: nodeInfo.nodeId,
                licensorName: nodeInfo.nodeName,
                licensorOwnerId: nodeInfo.ownerUserId,
                licensorOwnerName: nodeInfo.ownerUserName,
                policies: presentableInfo.policies,
                status: presentableInfo.onlineStatus === 1 ? 1 : 0, // 上线了才可用
            };
        });
    }

    /**
     * 乙方作为资源时,转换乙方信息
     * @param {string} resourceId
     * @returns {Promise<LicenseeInfo>}
     * @private
     */
    async _resourceInfoWrapToLicenseeInfo(resourceId: string): Promise<LicenseeInfo> {
        const resourceInfo: ResourceInfo = await this.ctx.curlIntranetApi(`${this.ctx.webApi.resourceInfoV2}/${resourceId}?projection=resourceName,userId,username,status`);
        if (!resourceInfo) {
            throw new ApplicationError(this.ctx.gettext('resource-entity-not-found'));
        }
        if (resourceInfo.userId !== this.ctx.userId) {
            throw new ApplicationError(this.ctx.gettext('user-authorization-failed'));
        }
        return {
            licenseeId: resourceId,
            licenseeName: resourceInfo.resourceName,
            licenseeOwnerId: resourceInfo.userId,
            licenseeOwnerName: resourceInfo.username
        };
    }

    /**
     * 节点信息转换为乙方信息
     * @param {number} nodeId
     * @returns {Promise<LicenseeInfo>}
     * @private
     */
    async _nodeInfoWrapToLicenseeInfo(nodeId: number): Promise<LicenseeInfo> {
        const nodeInfo = await this.getNodeInfo(nodeId);
        if (!nodeInfo) {
            throw new ApplicationError(this.ctx.gettext('node-entity-not-found'));
        }
        const {userInfo} = this.ctx.identityInfo;
        if (nodeInfo.ownerUserId !== userInfo.userId) {
            throw new ApplicationError(this.ctx.gettext('user-authorization-failed'));
        }
        return {
            licenseeId: nodeInfo.nodeId,
            licenseeName: nodeInfo.nodeName,
            licenseeOwnerId: userInfo.userId,
            licenseeOwnerName: userInfo.username
        };
    }

    /**
     * 用户信息转换为乙方
     * @param {number} userId
     * @returns {Promise<LicenseeInfo>}
     * @private
     */
    async _userInfoWrapToLicenseeInfo(userId: number): Promise<LicenseeInfo> {
        const userInfo = this.ctx.identityInfo?.userInfo as UserInfo;
        if (userInfo?.userId.toString() !== userId.toString()) {
            throw new ApplicationError(this.ctx.gettext('user-authorization-failed'));
        }
        return {
            licenseeId: userInfo.userId,
            licenseeName: userInfo.username,
            licenseeOwnerId: userInfo.userId,
            licenseeOwnerName: userInfo.username
        };
    }

    @init()
    _initial() {
        this.subjectWrapMap.set(SubjectTypeEnum.Resource, this._resourceInfoWrapToSubjectBaseInfo);
        this.subjectWrapMap.set(SubjectTypeEnum.Presentable, this._presentableWrapToSubjectBaseInfo);

        this.licenseeWrapMap.set(ContractLicenseeIdentityTypeEnum.ClientUser, this._userInfoWrapToLicenseeInfo);
        this.licenseeWrapMap.set(ContractLicenseeIdentityTypeEnum.Node, this._nodeInfoWrapToLicenseeInfo);
        this.licenseeWrapMap.set(ContractLicenseeIdentityTypeEnum.Resource, this._resourceInfoWrapToLicenseeInfo);
    }
}
