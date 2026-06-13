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
exports.QueueController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const queue_service_1 = require("./queue.service");
const create_queue_dto_1 = require("./dto/create-queue.dto");
const update_queue_settings_dto_1 = require("./dto/update-queue-settings.dto");
let QueueController = class QueueController {
    constructor(queueService) {
        this.queueService = queueService;
    }
    create(dto) {
        return this.queueService.create(dto);
    }
    findByBranch(branchId) {
        return this.queueService.findByBranch(branchId);
    }
    findOne(id) {
        return this.queueService.findById(id);
    }
    open(id) {
        return this.queueService.open(id);
    }
    pause(id) {
        return this.queueService.pause(id);
    }
    close(id) {
        return this.queueService.close(id);
    }
    updateSettings(id, dto) {
        return this.queueService.updateSettings(id, dto);
    }
};
exports.QueueController = QueueController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: "Create today's queue for a branch (idempotent)" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_queue_dto_1.CreateQueueDto]),
    __metadata("design:returntype", void 0)
], QueueController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('branch/:branchId'),
    (0, swagger_1.ApiOperation)({ summary: "Get today's active queue for a branch" }),
    __param(0, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QueueController.prototype, "findByBranch", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get queue by ID with live waiting/called counts' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QueueController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/open'),
    (0, swagger_1.ApiOperation)({ summary: 'Open (or resume from pause) the queue' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QueueController.prototype, "open", null);
__decorate([
    (0, common_1.Patch)(':id/pause'),
    (0, swagger_1.ApiOperation)({ summary: 'Pause the queue — no new tokens, existing tokens still served' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QueueController.prototype, "pause", null);
__decorate([
    (0, common_1.Patch)(':id/close'),
    (0, swagger_1.ApiOperation)({ summary: 'Close the queue for the day' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QueueController.prototype, "close", null);
__decorate([
    (0, common_1.Patch)(':id/settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Update queue settings (avg time, emergency tokens, etc.)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_queue_settings_dto_1.UpdateQueueSettingsDto]),
    __metadata("design:returntype", void 0)
], QueueController.prototype, "updateSettings", null);
exports.QueueController = QueueController = __decorate([
    (0, swagger_1.ApiTags)('queue'),
    (0, common_1.Controller)('queue'),
    __metadata("design:paramtypes", [queue_service_1.QueueService])
], QueueController);
//# sourceMappingURL=queue.controller.js.map