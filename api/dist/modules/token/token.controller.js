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
exports.TokenController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const token_service_1 = require("./token.service");
const join_token_dto_1 = require("./dto/join-token.dto");
const emergency_token_dto_1 = require("./dto/emergency-token.dto");
const update_charge_dto_1 = require("./dto/update-charge.dto");
const token_schema_1 = require("./token.schema");
let TokenController = class TokenController {
    constructor(tokenService) {
        this.tokenService = tokenService;
    }
    join(dto) {
        return this.tokenService.join(dto);
    }
    createEmergency(dto) {
        return this.tokenService.createEmergency(dto);
    }
    getQueueTokens(queueId, status) {
        const statusArray = status
            ? Array.isArray(status) ? status : [status]
            : undefined;
        return this.tokenService.getQueueTokens(queueId, statusArray);
    }
    findOne(id) {
        return this.tokenService.findById(id);
    }
    call(id) {
        return this.tokenService.call(id);
    }
    complete(id) {
        return this.tokenService.complete(id);
    }
    skip(id) {
        return this.tokenService.skip(id);
    }
    recall(id) {
        return this.tokenService.recall(id);
    }
    cancel(id) {
        return this.tokenService.cancel(id);
    }
    updateCharge(id, dto) {
        return this.tokenService.updateCharge(id, dto);
    }
};
exports.TokenController = TokenController;
__decorate([
    (0, common_1.Post)('join'),
    (0, swagger_1.ApiOperation)({ summary: 'Customer joins a queue (normal token)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [join_token_dto_1.JoinTokenDto]),
    __metadata("design:returntype", void 0)
], TokenController.prototype, "join", null);
__decorate([
    (0, common_1.Post)('emergency'),
    (0, swagger_1.ApiOperation)({ summary: 'Receptionist issues an emergency token (jumps queue)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [emergency_token_dto_1.EmergencyTokenDto]),
    __metadata("design:returntype", void 0)
], TokenController.prototype, "createEmergency", null);
__decorate([
    (0, common_1.Get)('queue/:queueId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all tokens for a queue, optionally filtered by status' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, isArray: true, enum: token_schema_1.TokenStatus }),
    __param(0, (0, common_1.Param)('queueId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TokenController.prototype, "getQueueTokens", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a token by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TokenController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/call'),
    (0, swagger_1.ApiOperation)({ summary: 'Call a WAITING token — set status to CALLED, notify customer' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TokenController.prototype, "call", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark a token as completed' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TokenController.prototype, "complete", null);
__decorate([
    (0, common_1.Patch)(':id/skip'),
    (0, swagger_1.ApiOperation)({ summary: 'Skip current token — move it to SKIPPED, recalculate queue' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TokenController.prototype, "skip", null);
__decorate([
    (0, common_1.Patch)(':id/recall'),
    (0, swagger_1.ApiOperation)({ summary: 'Re-notify customer that their token is called (no status change)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TokenController.prototype, "recall", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a token' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TokenController.prototype, "cancel", null);
__decorate([
    (0, common_1.Patch)(':id/charge'),
    (0, swagger_1.ApiOperation)({ summary: 'Set or update the charge for a token (Confirmed or Waived)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_charge_dto_1.UpdateChargeDto]),
    __metadata("design:returntype", void 0)
], TokenController.prototype, "updateCharge", null);
exports.TokenController = TokenController = __decorate([
    (0, swagger_1.ApiTags)('token'),
    (0, common_1.Controller)('token'),
    __metadata("design:paramtypes", [token_service_1.TokenService])
], TokenController);
//# sourceMappingURL=token.controller.js.map