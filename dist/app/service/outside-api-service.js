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
    subjectWrapMap = new Map();
    licenseeWrapMap = new Map();
    ctx;
    /**
     * 合约支付
     * @param fromAccountId
     * @param toAccountId
     * @param transactionAmount
     * @param contractId
     * @param subjectType
     * @param contractName
     * @param subjectName
     * @param eventId
     * @param password
     */
    async contractPayment(fromAccountId, toAccountId, transactionAmount, contractId, subjectType, subjectName, contractName, eventId, password) {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.transactionInfoV2}/contracts/payment`, {
            method: 'post', contentType: 'json', data: {
                fromAccountId, toAccountId, transactionAmount, contractId,
                subjectType, subjectName, contractName, eventId, password
            }
        }).catch(error => {
            throw new egg_freelog_base_1.ApiInvokingError(error.message, {
                code: error.data?.apiInvokingAttachData?.code ?? 'E1999'
            });
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
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.userInfoV2}/${userId}`);
    }
    /**
     * 获取用户交易账号
     */
    async getIndividualTransactionAccounts(userId) {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.accountInfoV2}/admin/individualAccounts/${userId}`);
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
        return (0, lodash_1.first)(subjectBaseInfos);
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
        if (!(0, lodash_1.isArray)(subjectIds) || (0, lodash_1.isEmpty)(subjectIds)) {
            return [];
        }
        return this.subjectWrapMap.get(subjectType).call(this, (0, lodash_1.uniq)(subjectIds));
    }
    /**
     * 获取乙方信息
     * @param licenseeId
     * @param identityType
     */
    async getLicenseeInfo(licenseeId, identityType) {
        if (!this.licenseeWrapMap.has(identityType)) {
            throw new egg_freelog_base_1.ApplicationError(`please check code, not support identityType:${identityType}.`);
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
        const invalidResourceIds = (0, lodash_1.differenceWith)(resourceIds, resourceInfos, (x, y) => x === y.resourceId);
        if (!(0, lodash_1.isEmpty)(invalidResourceIds)) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('sign-subject-invalid-error', `,resourceId:[${invalidResourceIds.toString()}]`));
        }
        const offlineResourceIds = resourceInfos.filter(x => x.status !== 1).map(x => x.resourceId);
        if (!(0, lodash_1.isEmpty)(offlineResourceIds)) {
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
    async _presentableWrapToSubjectBaseInfo(presentableIds) {
        const presentableInfos = await this.ctx.curlIntranetApi(`${this.ctx.webApi.presentableInfoV2}/list?presentableIds=${presentableIds.toString()}&projection=presentableId,presentableName,policies,nodeId,onlineStatus`);
        const invalidPresentableIds = (0, lodash_1.differenceWith)(presentableIds, presentableInfos, (x, y) => x === y.presentableId);
        if (!(0, lodash_1.isEmpty)(invalidPresentableIds)) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('sign-subject-invalid-error', `,presentableIds:[${invalidPresentableIds.toString()}]`));
        }
        const offlinePresentableIds = presentableInfos.filter(x => x.onlineStatus !== 1).map(x => x.presentableId);
        if (!(0, lodash_1.isEmpty)(offlinePresentableIds)) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('sign-subject-offline-error', `,resourceId:[${offlinePresentableIds.toString()}]`));
        }
        const nodeInfoMap = await this.ctx.curlIntranetApi(`${this.ctx.webApi.nodeInfoV2}/list?nodeIds=${presentableInfos.map(x => x.nodeId).toString()}`).then(list => {
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
        if (userInfo?.userId.toString() !== userId.toString()) {
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
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], OutsideApiService.prototype, "ctx", void 0);
__decorate([
    (0, midway_1.init)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OutsideApiService.prototype, "_initial", null);
OutsideApiService = __decorate([
    (0, midway_1.provide)()
], OutsideApiService);
exports.OutsideApiService = OutsideApiService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0c2lkZS1hcGktc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9vdXRzaWRlLWFwaS1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUE2QztBQUM3Qyx1REFNMEI7QUFJMUIsbUNBQXFFO0FBR3JFLElBQWEsaUJBQWlCLEdBQTlCLE1BQWEsaUJBQWlCO0lBRWpCLGNBQWMsR0FBK0UsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUN2RyxlQUFlLEdBQXdFLElBQUksR0FBRyxFQUFFLENBQUM7SUFHMUcsR0FBRyxDQUFpQjtJQUVwQjs7Ozs7Ozs7Ozs7T0FXRztJQUNILEtBQUssQ0FBQyxlQUFlLENBQUMsYUFBcUIsRUFBRSxXQUFtQixFQUFFLGlCQUF5QixFQUFFLFVBQWtCLEVBQUUsV0FBbUIsRUFBRSxXQUFtQixFQUFFLFlBQW9CLEVBQUUsT0FBZSxFQUFFLFFBQWdCO1FBQzlNLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsb0JBQW9CLEVBQUU7WUFDdEYsTUFBTSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTtnQkFDdkMsYUFBYSxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxVQUFVO2dCQUN6RCxXQUFXLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsUUFBUTthQUM1RDtTQUNKLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDYixNQUFNLElBQUksbUNBQWdCLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRTtnQkFDdEMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxJQUFJLE9BQU87YUFDM0QsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENB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