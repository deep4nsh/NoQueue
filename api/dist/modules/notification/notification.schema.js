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
exports.NotificationLogSchema = exports.NotificationLog = exports.NotificationStatus = exports.NotificationEvent = exports.NotificationChannel = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["FCM"] = "FCM";
    NotificationChannel["WHATSAPP"] = "WHATSAPP";
    NotificationChannel["SMS"] = "SMS";
    NotificationChannel["EMAIL"] = "EMAIL";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
var NotificationEvent;
(function (NotificationEvent) {
    NotificationEvent["TOKEN_JOINED"] = "TOKEN_JOINED";
    NotificationEvent["APPROACHING"] = "APPROACHING";
    NotificationEvent["CALLED"] = "CALLED";
    NotificationEvent["MISSED"] = "MISSED";
    NotificationEvent["CANCELLED"] = "CANCELLED";
    NotificationEvent["QUEUE_DELAYED"] = "QUEUE_DELAYED";
})(NotificationEvent || (exports.NotificationEvent = NotificationEvent = {}));
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["SENT"] = "SENT";
    NotificationStatus["FAILED"] = "FAILED";
    NotificationStatus["QUEUED"] = "QUEUED";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
let NotificationLog = class NotificationLog {
};
exports.NotificationLog = NotificationLog;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Token', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], NotificationLog.prototype, "tokenId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: NotificationChannel, required: true }),
    __metadata("design:type", String)
], NotificationLog.prototype, "channel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: NotificationEvent, required: true }),
    __metadata("design:type", String)
], NotificationLog.prototype, "event", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], NotificationLog.prototype, "recipient", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], NotificationLog.prototype, "templateId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], NotificationLog.prototype, "payload", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: NotificationStatus, default: NotificationStatus.QUEUED }),
    __metadata("design:type", String)
], NotificationLog.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], NotificationLog.prototype, "providerResponse", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], NotificationLog.prototype, "sentAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], NotificationLog.prototype, "failureReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], NotificationLog.prototype, "retryCount", void 0);
exports.NotificationLog = NotificationLog = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], NotificationLog);
exports.NotificationLogSchema = mongoose_1.SchemaFactory.createForClass(NotificationLog);
//# sourceMappingURL=notification.schema.js.map