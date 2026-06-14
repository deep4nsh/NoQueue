import { UserDocument } from './user.schema';
import { UserService } from './user.service';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getMe(user: UserDocument): Promise<{
        id: import("mongoose").Types.ObjectId;
        name: string;
        phone: string;
        email: string;
        photoUrl: string;
        role: import("./user.schema").Role;
        firebaseUid: string;
        businessId: import("mongoose").Types.ObjectId;
        isActive: boolean;
    }>;
    updateFcmToken(user: UserDocument, dto: {
        fcmToken: string;
    }): Promise<{
        success: boolean;
    }>;
}
