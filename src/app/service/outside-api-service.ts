import {provide, inject, init} from 'midway';
import {ApplicationError} from 'egg-freelog-base';
import {SubjectType, IdentityType} from '../../enum';
import {
    IOutsideApiService, LicenseeInfo, NodeInfo, SubjectBaseInfo, UserInfo
} from '../../interface';

import {differenceWith, isEmpty, first} from 'lodash';

@provide('outsideApiService')
export class OutsideApiService implements IOutsideApiService {

    readonly subjectWrapMap: Map<SubjectType, (subjectIds: string[]) => Promise<SubjectBaseInfo[]>> = new Map();
    readonly licenseeWrapMap: Map<number, (licenseeId: string | number) => Promise<LicenseeInfo>> = new Map();

    @inject()
    ctx;

    /**
     * 获取用户信息
     * @param {number} userId
     * @returns {Promise<UserInfo>}
     */
    async getUserInfo(userId: number): Promise<UserInfo> {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.userInfo}/${userId}`);
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
     * @param {string} subjectId 标的物ID
     * @param {SubjectType} subjectType 标的物类型
     * @returns {Promise<SubjectBaseInfo>}
     */
    async getSubjectInfo(subjectId: string, subjectType: SubjectType): Promise<SubjectBaseInfo> {
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
    async getSubjectInfos(subjectIds: string[], subjectType: SubjectType): Promise<SubjectBaseInfo[]> {
        if (!this.subjectWrapMap.has(subjectType)) {
            throw new ApplicationError(`please check code,not support subjectType:${subjectType}.`);
        }
        return this.subjectWrapMap.get(subjectType).call(this, subjectIds);
    }

    /**
     * 获取乙方信息
     * @param {string | number} licenseeId
     * @param {IdentityType} identityType
     * @returns {Promise<LicenseeInfo>}
     */
    async getLicenseeInfo(licenseeId: string | number, identityType: IdentityType): Promise<LicenseeInfo> {
        if (!this.licenseeWrapMap.has(identityType)) {
            throw new ApplicationError(`please check code,not support identityType:${identityType}.`);
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
        const resourceInfos = await this.ctx.curlIntranetApi(`${this.ctx.webApi.resourceInfoV2}/list?resourceIds=${resourceIds.toString()}&projection=resourceName,userId,username,policies,status`);
        const invalidResourceIds = differenceWith(resourceIds, resourceInfos, (x, y: any) => x === y.resourceId);
        if (!isEmpty(invalidResourceIds)) {
            throw new ApplicationError(this.ctx.gettext('sign-subject-invalid-error', `,resourceId:[${invalidResourceIds.toString()}]`));
        }
        const offlineResourceIds = resourceInfos.filter((x: any) => x.status !== 1).map(x => x.resourceId);
        if (!isEmpty(offlineResourceIds)) {
            throw new ApplicationError(this.ctx.gettext('sign-subject-offline-error', `,resourceId:[${offlineResourceIds.toString()}]`));
        }

        return resourceInfos.map((resourceInfo: any) => {
            return {
                subjectId: resourceInfo.resourceId,
                subjectType: SubjectType.Resource,
                subjectName: resourceInfo.resourceName,
                licensorId: resourceInfo.resourceId,
                licensorName: resourceInfo.resourceName,
                licensorOwnerId: resourceInfo.userId,
                licensorOwnerName: resourceInfo.username,
                policies: resourceInfo.policies,
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
        const presentableInfos = await this.ctx.curlIntranetApi(`${this.ctx.webApi.presentableInfo}/list?presentableIds=${presentableIds.toString()}`);
        const invalidPresentableIds = differenceWith(presentableIds, presentableInfos, (x, y: any) => x === y.presentableId);
        if (!isEmpty(invalidPresentableIds)) {
            throw new ApplicationError(this.ctx.gettext('sign-subject-invalid-error', `,presentableIds:[${invalidPresentableIds.toString()}]`));
        }
        const offlinePresentableIds = presentableInfos.filter((x: any) => x.isOnline !== 1).map(x => x.presentableId);
        if (!isEmpty(offlinePresentableIds)) {
            throw new ApplicationError(this.ctx.gettext('sign-subject-offline-error', `,resourceId:[${offlinePresentableIds.toString()}]`));
        }
        const nodeInfoMap = await this.ctx.curlIntranetApi(`${this.ctx.webApi.nodeInfoV2}/list?nodeId=${presentableInfos.map(x => x.nodeId).toString()}`).then(list => {
            return new Map(list.map(x => [x.nodeId, x]));
        });

        return presentableInfos.map((presentableInfo: any) => {
            const nodeInfo = nodeInfoMap.get(presentableInfo.nodeId);
            return {
                subjectId: presentableInfo.presentableId,
                subjectType: SubjectType.Presentable,
                subjectName: presentableInfo.presentableName,
                licensorId: nodeInfo.nodeId,
                licensorName: nodeInfo.nodeName,
                licensorOwnerId: nodeInfo.ownerUserId,
                licensorOwnerName: nodeInfo.ownerUserName,
                policies: presentableInfo.policies,
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
        const resourceInfo = await this.ctx.curlIntranetApi(`${this.ctx.webApi.resourceInfoV2}/${resourceId}?projection=resourceName,userId,username,status`);
        if (!resourceInfo) {
            throw new ApplicationError(this.ctx.gettext('resource-entity-not-found'));
        }
        if (resourceInfo.userId !== this.ctx.request.userId) {
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
        const {userInfo} = this.ctx.request.identityInfo;
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
        const {userInfo} = this.ctx.request.identityInfo;
        if (userInfo.userId !== userId) {
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
        this.subjectWrapMap.set(SubjectType.Resource, this._resourceInfoWrapToSubjectBaseInfo);
        this.subjectWrapMap.set(SubjectType.Presentable, this._presentableWrapToSubjectBaseInfo);

        this.licenseeWrapMap.set(IdentityType.ClientUser, this._userInfoWrapToLicenseeInfo);
        this.licenseeWrapMap.set(IdentityType.Node, this._nodeInfoWrapToLicenseeInfo);
        this.licenseeWrapMap.set(IdentityType.Resource, this._resourceInfoWrapToLicenseeInfo);
    }
}
