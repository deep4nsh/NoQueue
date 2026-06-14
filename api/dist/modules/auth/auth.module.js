"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const user_module_1 = require("../user/user.module");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const roles_guard_1 = require("./guards/roles.guard");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const local_strategy_1 = require("./strategies/local.strategy");
const firebaseAppProvider = {
    provide: 'FIREBASE_APP',
    inject: [config_1.ConfigService],
    useFactory: async (cfg) => {
        const projectId = cfg.get('FIREBASE_PROJECT_ID');
        const clientEmail = cfg.get('FIREBASE_CLIENT_EMAIL');
        const privateKey = cfg.get('FIREBASE_PRIVATE_KEY');
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
            const firebaseAdmin = require('firebase-admin');
            return firebaseAdmin.initializeApp({
                credential: firebaseAdmin.credential.cert(serviceAccount),
            });
        }
        catch (error) {
            console.warn('⚠️  Failed to initialize Firebase:', error.message);
            return null;
        }
    },
};
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            user_module_1.UserModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (cfg) => ({
                    secret: cfg.get('JWT_SECRET'),
                    signOptions: { expiresIn: cfg.get('JWT_EXPIRES_IN', '7d') },
                }),
            }),
        ],
        providers: [
            auth_service_1.AuthService,
            jwt_strategy_1.JwtStrategy,
            local_strategy_1.LocalStrategy,
            firebaseAppProvider,
            jwt_auth_guard_1.JwtAuthGuard,
            roles_guard_1.RolesGuard,
        ],
        controllers: [auth_controller_1.AuthController],
        exports: [auth_service_1.AuthService, jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, jwt_1.JwtModule],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map