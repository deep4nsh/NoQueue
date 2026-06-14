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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_schema_1 = require("./notification.schema");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(notificationLogModel, firebaseApp) {
        this.notificationLogModel = notificationLogModel;
        this.firebaseApp = firebaseApp;
        this.logger = new common_1.Logger(NotificationService_1.name);
    }
    async sendFcmNotification(fcmToken, title, body, data) {
        if (!this.firebaseApp) {
            this.logger.warn('Firebase not configured, FCM notification skipped');
            return null;
        }
        try {
            const messaging = this.firebaseApp.messaging();
            const message = {
                notification: { title, body },
                data: data || {},
                token: fcmToken,
            };
            const messageId = await messaging.send(message);
            this.logger.debug(`FCM sent: ${messageId}`);
            return messageId;
        }
        catch (error) {
            this.logger.error(`FCM failed: ${error.message}`);
            return null;
        }
    }
    async logNotification(tokenId, channel, event, recipient, payload, status = notification_schema_1.NotificationStatus.QUEUED) {
        const log = new this.notificationLogModel({
            tokenId: new mongoose_2.Types.ObjectId(tokenId),
            channel,
            event,
            recipient,
            payload,
            status,
        });
        return log.save();
    }
    async getTokenNotifications(tokenId) {
        return this.notificationLogModel
            .find({ tokenId: new mongoose_2.Types.ObjectId(tokenId) })
            .sort({ createdAt: -1 })
            .exec();
    }
    async markAsSent(logId, providerResponse) {
        return this.notificationLogModel
            .findByIdAndUpdate(logId, {
            status: notification_schema_1.NotificationStatus.SENT,
            sentAt: new Date(),
            providerResponse,
        }, { new: true })
            .exec();
    }
    async markAsFailed(logId, reason) {
        return this.notificationLogModel
            .findByIdAndUpdate(logId, {
            status: notification_schema_1.NotificationStatus.FAILED,
            failureReason: reason,
            $inc: { retryCount: 1 },
        }, { new: true })
            .exec();
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_1.NotificationLog.name)),
    __param(1, (0, common_1.Inject)('FIREBASE_APP')),
    __metadata("design:paramtypes", [mongoose_2.Model, Object])
], NotificationService);
//# sourceMappingURL=notification.service.js.map