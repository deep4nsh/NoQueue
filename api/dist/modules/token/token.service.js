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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const token_schema_1 = require("./token.schema");
const queue_schema_1 = require("../queue/queue.schema");
const service_schema_1 = require("../service/service.schema");
const queue_gateway_1 = require("../../gateways/queue.gateway");
let TokenService = class TokenService {
    constructor(tokenModel, queueModel, serviceModel, gateway) {
        this.tokenModel = tokenModel;
        this.queueModel = queueModel;
        this.serviceModel = serviceModel;
        this.gateway = gateway;
    }
    async join(dto, userId) {
        const queue = await this._getOpenQueue(dto.queueId);
        const service = dto.serviceId
            ? await this.serviceModel.findById(dto.serviceId).exec()
            : null;
        queue.lastTokenIssued += 1;
        await queue.save();
        const displayToken = `${queue.prefix}-${queue.lastTokenIssued}`;
        const waitingTokens = await this._getActiveTokens(queue._id);
        const position = waitingTokens.length + 1;
        const estimatedWait = position * queue.averageServiceTime;
        const token = await this.tokenModel.create({
            queueId: queue._id,
            branchId: queue.branchId,
            businessId: queue.businessId,
            tokenNumber: queue.lastTokenIssued,
            displayToken,
            customer: {
                name: dto.customer.name,
                phone: dto.customer.phone ?? null,
                email: null,
                userId: userId ? new mongoose_2.Types.ObjectId(userId) : null,
            },
            status: token_schema_1.TokenStatus.WAITING,
            priority: token_schema_1.TokenPriority.NORMAL,
            source: token_schema_1.TokenSource.WEB,
            position,
            estimatedWaitMinutes: estimatedWait,
            service: service ? this._snapshotService(service) : null,
            charge: service
                ? {
                    defaultAmount: service.charge.amount,
                    finalAmount: null,
                    currency: service.charge.currency,
                    status: token_schema_1.ChargeStatus.PENDING,
                    editedBy: null,
                    editedAt: null,
                }
                : null,
            notes: dto.notes ?? '',
            joinedAt: new Date(),
        });
        this.gateway.emitTokenJoined(dto.queueId, token.toObject());
        this.gateway.emitQueueRefresh(dto.queueId);
        return token;
    }
    async createEmergency(dto) {
        const queue = await this._getOpenQueue(dto.queueId);
        if (!queue.settings.allowEmergencyTokens) {
            throw new common_1.BadRequestException('Emergency tokens are not enabled on this queue');
        }
        const service = dto.serviceId
            ? await this.serviceModel.findById(dto.serviceId).exec()
            : null;
        queue.lastEmergencyTokenIssued += 1;
        await queue.save();
        const displayToken = `E-${String(queue.lastEmergencyTokenIssued).padStart(3, '0')}`;
        const token = await this.tokenModel.create({
            queueId: queue._id,
            branchId: queue.branchId,
            businessId: queue.businessId,
            tokenNumber: queue.lastEmergencyTokenIssued,
            displayToken,
            customer: {
                name: dto.customer.name,
                phone: dto.customer.phone ?? null,
                email: null,
                userId: null,
            },
            status: token_schema_1.TokenStatus.WAITING,
            priority: token_schema_1.TokenPriority.EMERGENCY,
            priorityReason: dto.reason,
            source: token_schema_1.TokenSource.EMERGENCY,
            position: 1,
            estimatedWaitMinutes: queue.averageServiceTime,
            service: service ? this._snapshotService(service) : null,
            charge: service
                ? {
                    defaultAmount: service.charge.amount,
                    finalAmount: null,
                    currency: service.charge.currency,
                    status: token_schema_1.ChargeStatus.PENDING,
                    editedBy: null,
                    editedAt: null,
                }
                : null,
            notes: dto.notes ?? '',
            joinedAt: new Date(),
        });
        await this._recalculatePositions(queue._id, queue.averageServiceTime);
        this.gateway.emitTokenJoined(dto.queueId, token.toObject());
        this.gateway.emitQueueRefresh(dto.queueId);
        return token;
    }
    async findById(id) {
        const token = await this.tokenModel.findById(id).exec();
        if (!token)
            throw new common_1.NotFoundException('Token not found');
        return token;
    }
    async getQueueTokens(queueId, status) {
        const filter = { queueId: new mongoose_2.Types.ObjectId(queueId) };
        if (status?.length) {
            filter.status = { $in: status };
        }
        const tokens = await this.tokenModel.find(filter).exec();
        return this._sortByPriorityThenTime(tokens);
    }
    async call(id) {
        const token = await this.findById(id);
        if (token.status !== token_schema_1.TokenStatus.WAITING) {
            throw new common_1.BadRequestException('Only WAITING tokens can be called');
        }
        token.status = token_schema_1.TokenStatus.CALLED;
        token.calledAt = new Date();
        await token.save();
        const queueId = token.queueId.toString();
        this.gateway.emitTokenCalled(queueId, {
            tokenId: id,
            displayToken: token.displayToken,
            customerName: token.customer.name,
        });
        this.gateway.emitQueueRefresh(queueId);
        return token;
    }
    async complete(id) {
        const token = await this.findById(id);
        const queue = await this.queueModel.findById(token.queueId).exec();
        const avgTime = queue?.averageServiceTime ?? 10;
        token.status = token_schema_1.TokenStatus.COMPLETED;
        token.completedAt = new Date();
        if (token.charge && token.charge.status === token_schema_1.ChargeStatus.PENDING) {
            token.charge.finalAmount = token.charge.defaultAmount;
            token.charge.status = token_schema_1.ChargeStatus.CONFIRMED;
            token.charge.editedAt = new Date();
        }
        await token.save();
        await this._recalculatePositions(token.queueId, avgTime);
        const queueId = token.queueId.toString();
        this.gateway.emitTokenCompleted(queueId, id);
        this.gateway.emitQueueRefresh(queueId);
        return token;
    }
    async skip(id) {
        const token = await this.findById(id);
        if (![token_schema_1.TokenStatus.WAITING, token_schema_1.TokenStatus.CALLED].includes(token.status)) {
            throw new common_1.BadRequestException('Only WAITING or CALLED tokens can be skipped');
        }
        const queue = await this.queueModel.findById(token.queueId).exec();
        const avgTime = queue?.averageServiceTime ?? 10;
        token.status = token_schema_1.TokenStatus.SKIPPED;
        token.skippedAt = new Date();
        await token.save();
        await this._recalculatePositions(token.queueId, avgTime);
        const queueId = token.queueId.toString();
        this.gateway.emitTokenSkipped(queueId, id);
        this.gateway.emitQueueRefresh(queueId);
        return token;
    }
    async cancel(id) {
        const token = await this.findById(id);
        const queue = await this.queueModel.findById(token.queueId).exec();
        const avgTime = queue?.averageServiceTime ?? 10;
        token.status = token_schema_1.TokenStatus.CANCELLED;
        await token.save();
        await this._recalculatePositions(token.queueId, avgTime);
        const queueId = token.queueId.toString();
        this.gateway.emitTokenCancelled(queueId, id);
        this.gateway.emitQueueRefresh(queueId);
        return token;
    }
    async recall(id) {
        const token = await this.findById(id);
        if (token.status !== token_schema_1.TokenStatus.CALLED) {
            throw new common_1.BadRequestException('Only CALLED tokens can be recalled');
        }
        token.recalledCount = (token.recalledCount ?? 0) + 1;
        await token.save();
        this.gateway.emitTokenCalled(token.queueId.toString(), {
            tokenId: id,
            displayToken: token.displayToken,
            customerName: token.customer.name,
        });
        return { success: true };
    }
    async updateCharge(id, dto) {
        const token = await this.findById(id);
        if (!token.charge) {
            throw new common_1.BadRequestException('This token has no charge information');
        }
        if (dto.finalAmount !== undefined && token.service?.serviceId) {
            const service = await this.serviceModel.findById(token.service.serviceId).exec();
            if (service) {
                if (!service.charge.isEditable) {
                    throw new common_1.BadRequestException('Charge is not editable for this service');
                }
                if (service.charge.minAmount !== null && dto.finalAmount < service.charge.minAmount) {
                    throw new common_1.BadRequestException(`Charge cannot be less than ₹${service.charge.minAmount / 100}`);
                }
                if (service.charge.maxAmount !== null && dto.finalAmount > service.charge.maxAmount) {
                    throw new common_1.BadRequestException(`Charge cannot exceed ₹${service.charge.maxAmount / 100}`);
                }
            }
        }
        token.charge.finalAmount = dto.finalAmount ?? token.charge.defaultAmount;
        token.charge.status = dto.status;
        token.charge.editedAt = new Date();
        await token.save();
        return token;
    }
    async _getOpenQueue(queueId) {
        const queue = await this.queueModel.findById(queueId).exec();
        if (!queue)
            throw new common_1.NotFoundException('Queue not found');
        if (queue.status === queue_schema_1.QueueStatus.CLOSED) {
            throw new common_1.BadRequestException('Queue is closed');
        }
        return queue;
    }
    async _getActiveTokens(queueId) {
        return this.tokenModel
            .find({ queueId, status: { $in: [token_schema_1.TokenStatus.WAITING, token_schema_1.TokenStatus.CALLED] } })
            .exec();
    }
    async _recalculatePositions(queueId, avgServiceTime) {
        const tokens = await this._getActiveTokens(queueId);
        const sorted = this._sortByPriorityThenTime(tokens);
        const ops = sorted.map((token, index) => this.tokenModel.updateOne({ _id: token._id }, {
            $set: {
                position: index + 1,
                estimatedWaitMinutes: (index + 1) * avgServiceTime,
            },
        }));
        await Promise.all(ops);
    }
    _sortByPriorityThenTime(tokens) {
        return [...tokens].sort((a, b) => {
            if (a.priority !== b.priority) {
                return a.priority === token_schema_1.TokenPriority.EMERGENCY ? -1 : 1;
            }
            return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
        });
    }
    _snapshotService(service) {
        return {
            serviceId: service._id,
            name: service.name,
            code: service.code,
            estimatedDuration: service.estimatedDuration,
        };
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(token_schema_1.TokenEntity.name)),
    __param(1, (0, mongoose_1.InjectModel)(queue_schema_1.QueueEntity.name)),
    __param(2, (0, mongoose_1.InjectModel)(service_schema_1.ServiceEntity.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model, typeof (_a = typeof queue_gateway_1.QueueGateway !== "undefined" && queue_gateway_1.QueueGateway) === "function" ? _a : Object])
], TokenService);
//# sourceMappingURL=token.service.js.map