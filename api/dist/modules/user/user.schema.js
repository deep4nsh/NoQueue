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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = exports.UserEntity = exports.Role = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var Role;
(function (Role) {
    Role["CUSTOMER"] = "CUSTOMER";
    Role["RECEPTIONIST"] = "RECEPTIONIST";
    Role["OWNER"] = "OWNER";
    Role["ADMIN"] = "ADMIN";
})(Role || (exports.Role = Role = {}));
let UserEntity = class UserEntity {
};
exports.UserEntity = UserEntity;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ sparse: true, unique: true, default: null, index: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ sparse: true, unique: true, default: null, index: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], UserEntity.prototype, "photoUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: Role, default: Role.CUSTOMER }),
    __metadata("design:type", String)
], UserEntity.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ sparse: true, unique: true, default: null, index: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "firebaseUid", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null, select: false }),
    __metadata("design:type", String)
], UserEntity.prototype, "passwordHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Business', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], UserEntity.prototype, "businessId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], UserEntity.prototype, "fcmToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], UserEntity.prototype, "lastLoginAt", void 0);
exports.UserEntity = UserEntity = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], UserEntity);
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(UserEntity);
exports.UserSchema.index({ phone: 1 }, { sparse: true, unique: true });
exports.UserSchema.index({ email: 1 }, { sparse: true, unique: true });
exports.UserSchema.index({ firebaseUid: 1 }, { sparse: true, unique: true });
//# sourceMappingURL=user.schema.js.map