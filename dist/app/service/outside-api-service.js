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
        const resourceInfos = await this.ctx.curlIntranetApi(`${this.ctx.webApi.resourceInfoV2}/list?resourceIds=${resourceIds.toString()}&projection=resourceName,userId,username,policies,status`);
        const invalidResourceIds = lodash_1.differenceWith(resourceIds, resourceInfos, (x, y) => x === y.resourceId);
        if (!lodash_1.isEmpty(invalidResourceIds)) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('sign-subject-invalid-error', `,resourceId:[${invalidResourceIds.toString()}]`));
        }
        const offlineResourceIds = resourceInfos.filter((x) => x.status !== 1).map(x => x.resourceId);
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
        const presentableInfos = await this.ctx.curlIntranetApi(`${this.ctx.webApi.presentableInfo}/list?presentableIds=${presentableIds.toString()}`);
        const invalidPresentableIds = lodash_1.differenceWith(presentableIds, presentableInfos, (x, y) => x === y.presentableId);
        if (!lodash_1.isEmpty(invalidPresentableIds)) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('sign-subject-invalid-error', `,presentableIds:[${invalidPresentableIds.toString()}]`));
        }
        const offlinePresentableIds = presentableInfos.filter((x) => x.isOnline !== 1).map(x => x.presentableId);
        if (!lodash_1.isEmpty(offlinePresentableIds)) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('sign-subject-offline-error', `,resourceId:[${offlinePresentableIds.toString()}]`));
        }
        const nodeInfoMap = await this.ctx.curlIntranetApi(`${this.ctx.webApi.nodeInfoV2}/list?nodeId=${presentableInfos.map(x => x.nodeId).toString()}`).then(list => {
            return new Map(list.map(x => [x.nodeId, x]));
        });
        return presentableInfos.map((presentableInfo) => {
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
        const { userInfo } = this.ctx.request.identityInfo;
        if (userInfo.userId !== userId) {
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