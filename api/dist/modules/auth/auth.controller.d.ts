import { FirebaseAuthDto } from './dto/firebase-auth.dto';
import { AuthService } from './auth.service';
import { UserDocument } from '../user/user.schema';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    loginStaff(user: UserDocument): Promise<import("./auth.service").LoginResponse>;
    loginWithFirebase(dto: FirebaseAuthDto): Promise<import("./auth.service").LoginResponse>;
}
