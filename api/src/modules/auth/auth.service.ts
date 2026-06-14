import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserDocument, UserEntity } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { JwtPayload } from './strategies/jwt.strategy';

export class LoginResponse {
  accessToken: string;
  user: SafeUser;
}

export class SafeUser {
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

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private cfg: ConfigService,
    @InjectModel(UserEntity.name) private userModel: Model<UserDocument>,
    @Inject('FIREBASE_APP') private firebaseApp: any,
  ) {}

  async validateStaffCredentials(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ email }).select('+passwordHash').exec();

    if (!user || !user.passwordHash) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    return isPasswordValid ? user : null;
  }

  async loginStaff(user: UserDocument): Promise<LoginResponse> {
    await this.userService.updateLastLogin(user._id.toString());
    const accessToken = this.generateJwt(user);
    return {
      accessToken,
      user: this.toSafeUser(user),
    };
  }

  async loginWithFirebase(idToken: string): Promise<LoginResponse> {
    if (!this.firebaseApp) {
      throw new Error('Firebase is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env');
    }

    const auth = (this.firebaseApp as any).auth();
    const decodedToken = await auth.verifyIdToken(idToken);

    const user = await this.userService.findOrCreateByFirebaseUid(decodedToken.uid, {
      name: decodedToken.name || 'Unknown',
      phone: decodedToken.phone_number || null,
      email: decodedToken.email || null,
      photoUrl: decodedToken.picture || null,
    });

    await this.userService.updateLastLogin(user._id.toString());
    const accessToken = this.generateJwt(user);

    return {
      accessToken,
      user: this.toSafeUser(user),
    };
  }

  private generateJwt(user: UserDocument): string {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      role: user.role,
      name: user.name,
    };
    return this.jwtService.sign(payload);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  private toSafeUser(user: UserDocument): SafeUser {
    return {
      id: user._id.toString(),
      name: user.name,
      phone: user.phone,
      email: user.email,
      photoUrl: user.photoUrl,
      role: user.role,
      firebaseUid: user.firebaseUid,
      businessId: user.businessId?.toString() || null,
      isActive: user.isActive,
    };
  }
}
