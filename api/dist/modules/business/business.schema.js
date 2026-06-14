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
exports.BusinessSchema = exports.Business = exports.BusinessType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var BusinessType;
(function (BusinessType) {
    BusinessType["CLINIC"] = "CLINIC";
    BusinessType["LAB"] = "LAB";
    BusinessType["SALON"] = "SALON";
    BusinessType["DENTAL"] = "DENTAL";
    BusinessType["PHYSIO"] = "PHYSIO";
    BusinessType["VET"] = "VET";
    BusinessType["SPA"] = "SPA";
    BusinessType["AUTO"] = "AUTO";
    BusinessType["REPAIR"] = "REPAIR";
    BusinessType["OPTICAL"] = "OPTICAL";
    BusinessType["OTHER"] = "OTHER";
})(BusinessType || (exports.BusinessType = BusinessType = {}));
let Business = class Business {
};
exports.Business = Business;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Business.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Business.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: BusinessType, default: BusinessType.OTHER }),
    __metadata("design:type", String)
], Business.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Business.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Business.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Business.prototype, "logoUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Business.prototype, "address", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'IN' }),
    __metadata("design:type", String)
], Business.prototype, "country", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Asia/Kolkata' }),
    __metadata("design:type", String)
], Business.prototype, "timezone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'UserEntity' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Business.prototype, "owner", void 0);
exports.Business = Business = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Business);
exports.BusinessSchema = mongoose_1.SchemaFactory.createForClass(Business);
//# sourceMappingURL=business.schema.js.map