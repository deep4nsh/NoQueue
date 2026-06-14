import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserEntity, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(UserEntity.name) private userModel: Model<UserDocument>) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByPhone(phone: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ phone }).exec();
  }

  async findByFirebaseUid(uid: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ firebaseUid: uid }).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const user = new this.userModel(dto);
    return user.save();
  }

  async findOrCreateByFirebaseUid(
    uid: string,
    defaults: Partial<CreateUserDto>,
  ): Promise<UserDocument> {
    let user = await this.findByFirebaseUid(uid);
    if (!user) {
      user = await this.create({
        ...defaults,
        firebaseUid: uid,
      } as CreateUserDto);
    }
    return user;
  }

  async updateFcmToken(id: string, fcmToken: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { fcmToken }).exec();
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { lastLoginAt: new Date() }).exec();
  }

  async setPasswordHash(id: string, hash: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { passwordHash: hash }).exec();
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }
}
