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
const lodash_1 = require("lodash");
let OutsideApiService = class OutsideApiService {
    constructor() {
        this.subjectWrapMap = new Map();
        this.licenseeWrapMap = new Map();
    }
    /**
     * 合约支付
     * @param fromAccountId
     * @param toAccountId
     * @param transactionAmount
     * @param contractId
     * @param contractName
     * @param eventId
     * @param password
     */
    async contractPayment(fromAccountId, toAccountId, transactionAmount, contractId, contractName, eventId, password) {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.transactionInfoV2}/contracts/payment`, {
            method: 'post', contentType: 'json', data: {
                fromAccountId, toAccountId, transactionAmount, contractId, contractName, eventId, password
            }
        });
    }
    /**
     * 查询交易记录信息
     * @param transactionRecordId
     */
    async getTransactionRecordInfo(transactionRecordId) {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.transactionInfoV2}/records/${transactionRecordId}`);
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
     * @param subjectId
     * @param subjectType
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
     * @param licenseeId
     * @param identityType
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
                subjectType: egg_freelog_base_1.SubjectTypeEnum.Resource,
                subjectName: resourceInfo.resourceName,
                licensorId: resourceInfo.resourceId,
                licensorName: resourceInfo.resourceName,
                licensorOwnerId: resourceInfo.userId,
                licensorOwnerName: resourceInfo.username,
                policies: resourceInfo.policies,
                status: resourceInfo.status === 1 ? 1 : 0,
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
                subjectType: egg_freelog_base_1.SubjectTypeEnum.Presentable,
                subjectName: presentableInfo.presentableName,
                licensorId: nodeInfo.nodeId,
                licensorName: nodeInfo.nodeName,
                licensorOwnerId: nodeInfo.ownerUserId,
                licensorOwnerName: nodeInfo.ownerUserName,
                policies: presentableInfo.policies,
                status: presentableInfo.onlineStatus === 1 ? 1 : 0,
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
        if (resourceInfo.userId !== this.ctx.userId) {
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
        const { userInfo } = this.ctx.identityInfo;
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
        const userInfo = this.ctx.identityInfo?.userInfo;
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
        this.subjectWrapMap.set(egg_freelog_base_1.SubjectTypeEnum.Resource, this._resourceInfoWrapToSubjectBaseInfo);
        this.subjectWrapMap.set(egg_freelog_base_1.SubjectTypeEnum.Presentable, this._presentableWrapToSubjectBaseInfo);
        this.licenseeWrapMap.set(egg_freelog_base_1.ContractLicenseeIdentityTypeEnum.ClientUser, this._userInfoWrapToLicenseeInfo);
        this.licenseeWrapMap.set(egg_freelog_base_1.ContractLicenseeIdentityTypeEnum.Node, this._nodeInfoWrapToLicenseeInfo);
        this.licenseeWrapMap.set(egg_freelog_base_1.ContractLicenseeIdentityTypeEnum.Resource, this._resourceInfoWrapToLicenseeInfo);
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
    midway_1.provide()
], OutsideApiService);
exports.OutsideApiService = OutsideApiService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0c2lkZS1hcGktc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9vdXRzaWRlLWFwaS1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUE2QztBQUM3Qyx1REFBcUg7QUFJckgsbUNBQXFFO0FBR3JFLElBQWEsaUJBQWlCLEdBQTlCLE1BQWEsaUJBQWlCO0lBQTlCO1FBRWEsbUJBQWMsR0FBK0UsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUN2RyxvQkFBZSxHQUF3RSxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBc085RyxDQUFDO0lBak9HOzs7Ozs7Ozs7T0FTRztJQUNILEtBQUssQ0FBQyxlQUFlLENBQUMsYUFBcUIsRUFBRSxXQUFtQixFQUFFLGlCQUF5QixFQUFFLFVBQWtCLEVBQUUsWUFBb0IsRUFBRSxPQUFlLEVBQUUsUUFBZ0I7UUFDcEssT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGlCQUFpQixvQkFBb0IsRUFBRTtZQUN0RixNQUFNLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO2dCQUN2QyxhQUFhLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLFFBQVE7YUFDN0Y7U0FDSixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLHdCQUF3QixDQUFDLG1CQUEyQjtRQUN0RCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLFlBQVksbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO0lBQzNHLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLFdBQVcsQ0FB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