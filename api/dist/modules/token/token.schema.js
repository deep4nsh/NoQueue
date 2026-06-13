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
exports.TokenSchema = exports.TokenEntity = exports.ChargeStatus = exports.TokenSource = exports.TokenStatus = exports.TokenPriority = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var TokenPriority;
(function (TokenPriority) {
    TokenPriority["NORMAL"] = "NORMAL";
    TokenPriority["EMERGENCY"] = "EMERGENCY";
})(TokenPriority || (exports.TokenPriority = TokenPriority = {}));
var TokenStatus;
(function (TokenStatus) {
    TokenStatus["WAITING"] = "WAITING";
    TokenStatus["CALLED"] = "CALLED";
    TokenStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TokenStatus["COMPLETED"] = "COMPLETED";
    TokenStatus["SKIPPED"] = "SKIPPED";
    TokenStatus["CANCELLED"] = "CANCELLED";
    TokenStatus["NO_SHOW"] = "NO_SHOW";
})(TokenStatus || (exports.TokenStatus = TokenStatus = {}));
var TokenSource;
(function (TokenSource) {
    TokenSource["QR_SCAN"] = "QR_SCAN";
    TokenSource["RECEPTIONIST"] = "RECEPTIONIST";
    TokenSource["WHATSAPP_BOT"] = "WHATSAPP_BOT";
    TokenSource["WEB"] = "WEB";
    TokenSource["API"] = "API";
    TokenSource["EMERGENCY"] = "EMERGENCY";
})(TokenSource || (exports.TokenSource = TokenSource = {}));
var ChargeStatus;
(function (ChargeStatus) {
    ChargeStatus["PENDING"] = "PENDING";
    ChargeStatus["CONFIRMED"] = "CONFIRMED";
    ChargeStatus["WAIVED"] = "WAIVED";
})(ChargeStatus || (exports.ChargeStatus = ChargeStatus = {}));
let CustomerInfo = class CustomerInfo {
};
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], CustomerInfo.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], CustomerInfo.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], CustomerInfo.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CustomerInfo.prototype, "userId", void 0);
CustomerInfo = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], CustomerInfo);
let ServiceSnapshot = class ServiceSnapshot {
};
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Service', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ServiceSnapshot.prototype, "serviceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], ServiceSnapshot.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], ServiceSnapshot.prototype, "code", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Number)
], ServiceSnapshot.prototype, "estimatedDuration", void 0);
ServiceSnapshot = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ServiceSnapshot);
let ChargeInfo = class ChargeInfo {
};
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Number)
], ChargeInfo.prototype, "defaultAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Number)
], ChargeInfo.prototype, "finalAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'INR' }),
    __metadata("design:type", String)
], ChargeInfo.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ChargeStatus, default: ChargeStatus.PENDING }),
    __metadata("design:type", String)
], ChargeInfo.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ChargeInfo.prototype, "editedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], ChargeInfo.prototype, "editedAt", void 0);
ChargeInfo = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ChargeInfo);
let TokenEntity = class TokenEntity {
};
exports.TokenEntity = TokenEntity;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Queue', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], TokenEntity.prototype, "queueId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Branch', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], TokenEntity.prototype, "branchId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Business', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], TokenEntity.prototype, "businessId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], TokenEntity.prototype, "tokenNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TokenEntity.prototype, "displayToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: CustomerInfo, required: true }),
    __metadata("design:type", CustomerInfo)
], TokenEntity.prototype, "customer", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: TokenStatus, default: TokenStatus.WAITING, index: true }),
    __metadata("design:type", String)
], TokenEntity.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: TokenPriority, default: TokenPriority.NORMAL, index: true }),
    __metadata("design:type", String)
], TokenEntity.prototype, "priority", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], TokenEntity.prototype, "priorityReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: TokenSource, default: TokenSource.RECEPTIONIST }),
    __metadata("design:type", String)
], TokenEntity.prototype, "source", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TokenEntity.prototype, "position", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TokenEntity.prototype, "estimatedWaitMinutes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: ServiceSnapshot, default: null }),
    __metadata("design:type", ServiceSnapshot)
], TokenEntity.prototype, "service", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: ChargeInfo, default: null }),
    __metadata("design:type", ChargeInfo)
], TokenEntity.prototype, "charge", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], TokenEntity.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], TokenEntity.prototype, "joinedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], TokenEntity.prototype, "calledAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], TokenEntity.prototype, "completedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], TokenEntity.prototype, "skippedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TokenEntity.prototype, "recalledCount", void 0);
exports.TokenEntity = TokenEntity = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], TokenEntity);
exports.TokenSchema = mongoose_1.SchemaFactory.createForClass(TokenEntity);
exports.TokenSchema.index({ queueId: 1, status: 1, priority: 1 });
exports.TokenSchema.index({ queueId: 1, status: 1, joinedAt: 1 });
//# sourceMappingURL=token.schema.js.map