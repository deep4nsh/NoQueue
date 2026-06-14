import { NotificationService } from './notification.service';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    getLog(tokenId: string): Promise<import("./notification.schema").NotificationLogDocument[]>;
    whatsappWebhook(payload: any): Promise<{
        success: boolean;
    }>;
}
