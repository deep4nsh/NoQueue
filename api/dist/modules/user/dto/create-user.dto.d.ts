import { Role } from '../user.schema';
export declare class CreateUserDto {
    name: string;
    phone?: string;
    email?: string;
    photoUrl?: string;
    role?: Role;
    firebaseUid?: string;
    passwordHash?: string;
    businessId?: string;
}
