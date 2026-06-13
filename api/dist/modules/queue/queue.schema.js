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
exports.QueueSchema = exports.QueueEntity = exports.QueueStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var QueueStatus;
(function (QueueStatus) {
    QueueStatus["OPEN"] = "OPEN";
    QueueStatus["PAUSED"] = "PAUSED";
    QueueStatus["CLOSED"] = "CLOSED";
})(QueueStatus || (exports.QueueStatus = QueueStatus = {}));
let QueueSettings = class QueueSettings {
};
__decorate([
    (0, mongoose_1.Prop)({ default: 500 }),
    __metadata("design:type", Number)
], QueueSettings.prototype, "maxTokens", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 3 }),
    __metadata("design:type", Number)
], QueueSettings.prototype, "alertAheadCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], QueueSettings.prototype, "autoCloseAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], QueueSettings.prototype, "allowRemoteJoin", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], QueueSettings.prototype, "requirePhone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], QueueSettings.prototype, "allowEmergencyTokens", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: ['RECEPTIONIST', 'BRANCH_MANAGER'] }),
    __metadata("design:type", Array)
], QueueSettings.prototype, "emergencyTokenRoles", void 0);
QueueSettings = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], QueueSettings);
let QueueEntity = class QueueEntity {
};
exports.QueueEntity = QueueEntity;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Branch', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], QueueEntity.prototype, "branchId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Business', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], QueueEntity.prototype, "businessId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], QueueEntity.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'A' }),
    __metadata("design:type", String)
], QueueEntity.prototype, "prefix", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], QueueEntity.prototype, "currentToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], QueueEntity.prototype, "lastTokenIssued", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], QueueEntity.prototype, "lastEmergencyTokenIssued", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 10 }),
    __metadata("design:type", Number)
], QueueEntity.prototype, "averageServiceTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: QueueStatus, default: QueueStatus.OPEN }),
    __metadata("design:type", String)
], QueueEntity.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: QueueSettings, default: () => ({}) }),
    __metadata("design:type", QueueSettings)
], QueueEntity.prototype, "settings", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], QueueEntity.prototype, "date", void 0);
exports.QueueEntity = QueueEntity = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], QueueEntity);
exports.QueueSchema = mongoose_1.SchemaFactory.createForClass(QueueEntity);
//# sourceMappingURL=queue.schema.js.map