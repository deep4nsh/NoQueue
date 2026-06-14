import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

const firebaseAppProvider = {
  provide: 'FIREBASE_APP',
  inject: [ConfigService],
  useFactory: async (cfg: ConfigService) => {
    const projectId = cfg.get('FIREBASE_PROJECT_ID');
    const clientEmail = cfg.get('FIREBASE_CLIENT_EMAIL');
    const privateKey = cfg.get('FIREBASE_PRIVATE_KEY');

    // If Firebase credentials are not configured, return null
    if (!projectId || !clientEmail || !privateKey) {
      console.warn('⚠️  Firebase credentials not configured. Firebase auth endpoints will fail.');
      return null;
    }

    try {
      const serviceAccount = {
        projectId,
        clientEmail,
        privateKey: privateKey.includes('\\n') ? privateKey.replace(/\\n/g, '\n') : privateKey,
      };

      // Use require to get the actual Firebase credential module
      const firebaseAdmin = require('firebase-admin');
      return firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount),
      });
    } catch (error) {
      console.warn('⚠️  Failed to initialize Firebase:', (error as Error).message);
      return null;
    }
  },
};

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get('JWT_SECRET'),
        signOptions: { expiresIn: cfg.get('JWT_EXPIRES_IN', '7d') },
      }),
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    firebaseAppProvider,
    JwtAuthGuard,
    RolesGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
