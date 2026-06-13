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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const queue_schema_1 = require("./queue.schema");
const token_schema_1 = require("../token/token.schema");
let QueueService = class QueueService {
    constructor(queueModel, tokenModel) {
        this.queueModel = queueModel;
        this.tokenModel = tokenModel;
    }
    async create(dto) {
        const existing = await this.queueModel
            .findOne({
            branchId: new mongoose_2.Types.ObjectId(dto.branchId),
            date: this._today(),
        })
            .exec();
        if (existing)
            return existing;
        return this.queueModel.create({
            branchId: new mongoose_2.Types.ObjectId(dto.branchId),
            businessId: new mongoose_2.Types.ObjectId(dto.businessId),
            name: dto.name,
            prefix: dto.prefix ?? 'A',
            averageServiceTime: dto.averageServiceTime ?? 10,
            status: queue_schema_1.QueueStatus.OPEN,
            date: this._today(),
        });
    }
    async findByBranch(branchId) {
        const queue = await this.queueModel
            .findOne({
            branchId: new mongoose_2.Types.ObjectId(branchId),
            date: this._today(),
        })
            .exec();
        if (!queue)
            throw new common_1.NotFoundException(`No queue for branch ${branchId} today`);
        return this._withLiveStats(queue);
    }
    async findById(id) {
        const queue = await this._getQueue(id);
        return this._withLiveStats(queue);
    }
    async open(id) {
        const queue = await this._getQueue(id);
        if (queue.status === queue_schema_1.QueueStatus.CLOSED) {
            throw new common_1.BadRequestException('A closed queue cannot be re-opened — create a new queue for today.');
        }
        queue.status = queue_schema_1.QueueStatus.OPEN;
        return queue.save();
    }
    async pause(id) {
        const queue = await this._getQueue(id);
        if (queue.status === queue_schema_1.QueueStatus.CLOSED) {
            throw new common_1.BadRequestException('Queue is already closed');
        }
        queue.status = queue_schema_1.QueueStatus.PAUSED;
        return queue.save();
    }
    async close(id) {
        const queue = await this._getQueue(id);
        queue.status = queue_schema_1.QueueStatus.CLOSED;
        return queue.save();
    }
    async updateSettings(id, dto) {
        const queue = await this._getQueue(id);
        if (dto.averageServiceTime !== undefined)
            queue.averageServiceTime = dto.averageServiceTime;
        if (dto.maxTokens !== undefined)
            queue.settings.maxTokens = dto.maxTokens;
        if (dto.alertAheadCount !== undefined)
            queue.settings.alertAheadCount = dto.alertAheadCount;
        if (dto.allowRemoteJoin !== undefined)
            queue.settings.allowRemoteJoin = dto.allowRemoteJoin;
        if (dto.requirePhone !== undefined)
            queue.settings.requirePhone = dto.requirePhone;
        if (dto.allowEmergencyTokens !== undefined)
            queue.settings.allowEmergencyTokens = dto.allowEmergencyTokens;
        return queue.save();
    }
    async _getQueue(id) {
        const queue = await this.queueModel.findById(id).exec();
        if (!queue)
            throw new common_1.NotFoundException('Queue not found');
        return queue;
    }
    async _withLiveStats(queue) {
        const queueId = queue._id;
        const [waitingCount, calledCount] = await Promise.all([
            this.tokenModel.countDocuments({
                queueId,
                status: token_schema_1.TokenStatus.WAITING,
            }),
            this.tokenModel.countDocuments({
                queueId,
                status: token_schema_1.TokenStatus.CALLED,
            }),
        ]);
        return { ...queue.toObject(), waitingCount, calledCount };
    }
    _today() {
        return new Date().toISOString().split('T')[0];
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(queue_schema_1.QueueEntity.name)),
    __param(1, (0, mongoose_1.InjectModel)(token_schema_1.TokenEntity.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], QueueService);
//# sourceMappingURL=queue.service.js.map