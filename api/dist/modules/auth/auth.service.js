"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = exports.SafeUser = exports.LoginResponse = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const user_schema_1 = require("../user/user.schema");
const user_service_1 = require("../user/user.service");
class LoginResponse {
}
exports.LoginResponse = LoginResponse;
class SafeUser {
}
exports.SafeUser = SafeUser;
let AuthService = class AuthService {
    constructor(userService, jwtService, cfg, userModel, firebaseApp) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.cfg = cfg;
        this.userModel = userModel;
        this.firebaseApp = firebaseApp;
    }
    async validateStaffCredentials(email, password) {
        const user = await this.userModel.findOne({ email }).select('+passwordHash').exec();
        if (!user || !user.passwordHash) {
            return null;
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        return isPasswordValid ? user : null;
    }
    async loginStaff(user) {
        await this.userService.updateLastLogin(user._id.toString());
        const accessToken = this.generateJwt(user);
        return {
            accessToken,
            user: this.toSafeUser(user),
        };
    }
    async loginWithFirebase(idToken) {
        if (!this.firebaseApp) {
            throw new Error('Firebase is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env');
        }
        const auth = this.firebaseApp.auth();
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
    generateJwt(user) {
        const payload = {
            sub: user._id.toString(),
            role: user.role,
            name: user.name,
        };
        return this.jwtService.sign(payload);
    }
    async hashPassword(password) {
        return bcrypt.hash(password, 12);
    }
    toSafeUser(user) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, mongoose_1.InjectModel)(user_schema_1.UserEntity.name)),
    __param(4, (0, common_1.Inject)('FIREBASE_APP')),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService,
        config_1.ConfigService,
        mongoose_2.Model, Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map