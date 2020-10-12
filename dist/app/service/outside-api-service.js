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
exports.OutsideApiService = void 0;
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
const enum_1 = require("../../enum");
const lodash_1 = require("lodash");
let OutsideApiService = class OutsideApiService {
    constructor() {
        this.subjectWrapMap = new Map();
        this.licenseeWrapMap = new Map();
    }
    /**
     * 获取用户信息
     * @param {number} userId
     * @returns {Promise<UserInfo>}
     */
    async getUserInfo(userId) {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.userInfo}/${userId}`);
    }
    /**
     * 获取节点信息
     * @param {number} nodeId
     * @returns {Promise<NodeInfo>}
     */
    async getNodeInfo(nodeId) {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.nodeInfoV2}/${nodeId}`);
    }
    /**
     * 获取标的物信息
     * @param {string} subjectId 标的物ID
     * @param {SubjectType} subjectType 标的物类型
     * @returns {Promise<SubjectBaseInfo>}
     */
    async getSubjectInfo(subjectId, subjectType) {
        if (!this.subjectWrapMap.has(subjectType)) {
            throw new egg_freelog_base_1.ApplicationError(`please check code,not support subjectType:${subjectType}.`);
        }
        const subjectBaseInfos = await this.subjectWrapMap.get(subjectType).call(this, [subjectId]);
        return lodash_1.first(subjectBaseInfos);
    }
    /**
     * 批量获取标的物信息
     * @param subjectIds
     * @param subjectType
     */
    async getSubjectInfos(subjectIds, subjectType) {
        if (!this.subjectWrapMap.has(subjectType)) {
            throw new egg_freelog_base_1.ApplicationError(`please check code,not support subjectType:${subjectType}.`);
        }
        if (!lodash_1.isArray(subjectIds) || lodash_1.isEmpty(subjectIds)) {
            return [];
        }
        return this.subjectWrapMap.get(subjectType).call(this, lodash_1.uniq(subjectIds));
    }
    /**
     * 获取乙方信息
     * @param {string | number} licenseeId
     * @param {IdentityType} identityType
     * @returns {Promise<LicenseeInfo>}
     */
    async getLicenseeInfo(licenseeId, identityType) {
        if (!this.licenseeWrapMap.has(identityType)) {
            throw new egg_freelog_base_1.ApplicationError(`please check code,not support identityType:${identityType}.`);
        }
        return this.licenseeWrapMap.get(identityType).call(this, licenseeId);
    }
    /**
     * 资源信息转换为标的物基础信息
     * @param {string[]} resourceIds
     * @returns {Promise<SubjectBaseInfo[]>}
     * @private
     */
    async _resourceInfoWrapToSubjectBaseInfo(resourceIds) {
        const resourceInfos = await this.ctx.curlIntranetApi(`${this.ctx.webApi.resourceInfoV2}/list?resourceIds=${resourceIds.toString()}&projection=resourceId,resourceName,userId,username,policies,status`);
        const invalidResourceIds = lodash_1.differenceWith(resourceIds, resourceInfos, (x, y) => x === y.resourceId);
        if (!lodash_1.isEmpty(invalidResourceIds)) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('sign-subject-invalid-error', `,resourceId:[${invalidResourceIds.toString()}]`));
        }
        const offlineResourceIds = resourceInfos.filter(x => x.status !== 1).map(x => x.resourceId);
        if (!lodash_1.isEmpty(offlineResourceIds)) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('sign-subject-offline-error', `,resourceId:[${offlineResourceIds.toString()}]`));
        }
        return resourceInfos.map((resourceInfo) => {
            return {
                subjectId: resourceInfo.resourceId,
                subjectType: enum_1.SubjectType.Resource,
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
    async _presentableWrapToSubjectBaseInfo(presentableIds) {
        const presentableInfos = await this.ctx.curlIntranetApi(`${this.ctx.webApi.presentableInfoV2}/list?presentableIds=${presentableIds.toString()}&projection=presentableId,presentableName,policies,nodeId,onlineStatus`);
        const invalidPresentableIds = lodash_1.differenceWith(presentableIds, presentableInfos, (x, y) => x === y.presentableId);
        if (!lodash_1.isEmpty(invalidPresentableIds)) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('sign-subject-invalid-error', `,presentableIds:[${invalidPresentableIds.toString()}]`));
        }
        const offlinePresentableIds = presentableInfos.filter(x => x.onlineStatus !== 1).map(x => x.presentableId);
        if (!lodash_1.isEmpty(offlinePresentableIds)) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('sign-subject-offline-error', `,resourceId:[${offlinePresentableIds.toString()}]`));
        }
        const nodeInfoMap = await this.ctx.curlIntranetApi(`${this.ctx.webApi.nodeInfoV2}/list?nodeId=${presentableInfos.map(x => x.nodeId).toString()}`).then(list => {
            return new Map(list.map(x => [x.nodeId, x]));
        });
        return presentableInfos.map(presentableInfo => {
            const nodeInfo = nodeInfoMap.get(presentableInfo.nodeId);
            return {
                subjectId: presentableInfo.presentableId,
                subjectType: enum_1.SubjectType.Presentable,
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
    async _resourceInfoWrapToLicenseeInfo(resourceId) {
        const resourceInfo = await this.ctx.curlIntranetApi(`${this.ctx.webApi.resourceInfoV2}/${resourceId}?projection=resourceName,userId,username,status`);
        if (!resourceInfo) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('resource-entity-not-found'));
        }
        if (resourceInfo.userId !== this.ctx.request.userId) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('user-authorization-failed'));
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
    async _nodeInfoWrapToLicenseeInfo(nodeId) {
        const nodeInfo = await this.getNodeInfo(nodeId);
        if (!nodeInfo) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('node-entity-not-found'));
        }
        const { userInfo } = this.ctx.request.identityInfo;
        if (nodeInfo.ownerUserId !== userInfo.userId) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('user-authorization-failed'));
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
    async _userInfoWrapToLicenseeInfo(userId) {
        const userInfo = this.ctx.request.identityInfo?.userInfo;
        if (userInfo?.userId !== userId) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('user-authorization-failed'));
        }
        return {
            licenseeId: userInfo.userId,
            licenseeName: userInfo.username,
            licenseeOwnerId: userInfo.userId,
            licenseeOwnerName: userInfo.username
        };
    }
    _initial() {
        this.subjectWrapMap.set(enum_1.SubjectType.Resource, this._resourceInfoWrapToSubjectBaseInfo);
        this.subjectWrapMap.set(enum_1.SubjectType.Presentable, this._presentableWrapToSubjectBaseInfo);
        this.licenseeWrapMap.set(enum_1.IdentityType.ClientUser, this._userInfoWrapToLicenseeInfo);
        this.licenseeWrapMap.set(enum_1.IdentityType.Node, this._nodeInfoWrapToLicenseeInfo);
        this.licenseeWrapMap.set(enum_1.IdentityType.Resource, this._resourceInfoWrapToLicenseeInfo);
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], OutsideApiService.prototype, "ctx", void 0);
__decorate([
    midway_1.init(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OutsideApiService.prototype, "_initial", null);
OutsideApiService = __decorate([
    midway_1.provide('outsideApiService')
], OutsideApiService);
exports.OutsideApiService = OutsideApiService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0c2lkZS1hcGktc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9vdXRzaWRlLWFwaS1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUE2QztBQUM3Qyx1REFBa0Q7QUFDbEQscUNBQXFEO0FBS3JELG1DQUFxRTtBQUdyRSxJQUFhLGlCQUFpQixHQUE5QixNQUFhLGlCQUFpQjtJQUE5QjtRQUVhLG1CQUFjLEdBQTJFLElBQUksR0FBRyxFQUFFLENBQUM7UUFDbkcsb0JBQWUsR0FBd0UsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQTRNOUcsQ0FBQztJQXZNRzs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFjO1FBQzVCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBYztRQUM1QixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxJQUFJLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDL0UsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLGNBQWMsQ0FBQyxTQUFpQixFQUFFLFdBQXdCO1FBQzVELElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUN2QyxNQUFNLElBQUksbUNBQWdCLENBQUMsNkNBQTZDLFdBQVcsR0FBRyxDQUFDLENBQUM7U0FDM0Y7UUFDRCxNQUFNLGdCQUFnQixHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsV0FBVyxD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