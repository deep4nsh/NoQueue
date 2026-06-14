import { Model } from 'mongoose';
import { UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    findById(id: string): Promise<UserDocument | null>;
    findByPhone(phone: string): Promise<UserDocument | null>;
    findByFirebaseUid(uid: string): Promise<UserDocument | null>;
    findByEmail(email: string): Promise<UserDocument | null>;
    create(dto: CreateUserDto): Promise<UserDocument>;
    findOrCreateByFirebaseUid(uid: string, defaults: Partial<CreateUserDto>): Promise<UserDocument>;
    updateFcmToken(id: string, fcmToken: string): Promise<void>;
    updateLastLogin(id: string): Promise<void>;
    setPasswordHash(id: string, hash: string): Promise<void>;
    update(id: string, dto: UpdateUserDto): Promise<UserDocument | null>;
}
