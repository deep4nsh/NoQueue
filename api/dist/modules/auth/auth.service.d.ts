import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { UserDocument } from '../user/user.schema';
import { UserService } from '../user/user.service';
export declare class LoginResponse {
    accessToken: string;
    user: SafeUser;
}
export declare class SafeUser {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    photoUrl: string | null;
    role: string;
    firebaseUid: string | null;
    businessId: string | null;
    isActive: boolean;
}
export declare class AuthService {
    private userService;
    private jwtService;
    private cfg;
    private userModel;
    private firebaseApp;
    constructor(userService: UserService, jwtService: JwtService, cfg: ConfigService, userModel: Model<UserDocument>, firebaseApp: any);
    validateStaffCredentials(email: string, password: string): Promise<UserDocument | null>;
    loginStaff(user: UserDocument): Promise<LoginResponse>;
    loginWithFirebase(idToken: string): Promise<LoginResponse>;
    private generateJwt;
    hashPassword(password: string): Promise<string>;
    private toSafeUser;
}
