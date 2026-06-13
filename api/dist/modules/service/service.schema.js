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
exports.ServiceSchema = exports.ServiceEntity = exports.ServiceCategory = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var ServiceCategory;
(function (ServiceCategory) {
    ServiceCategory["CONSULTATION"] = "CONSULTATION";
    ServiceCategory["DIAGNOSTICS"] = "DIAGNOSTICS";
    ServiceCategory["PROCEDURE"] = "PROCEDURE";
    ServiceCategory["THERAPY"] = "THERAPY";
    ServiceCategory["GROOMING"] = "GROOMING";
    ServiceCategory["OTHER"] = "OTHER";
})(ServiceCategory || (exports.ServiceCategory = ServiceCategory = {}));
let ChargeConfig = class ChargeConfig {
};
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], ChargeConfig.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'INR' }),
    __metadata("design:type", String)
], ChargeConfig.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], ChargeConfig.prototype, "isEditable", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: null }),
    __metadata("design:type", Number)
], ChargeConfig.prototype, "minAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: null }),
    __metadata("design:type", Number)
], ChargeConfig.prototype, "maxAmount", void 0);
ChargeConfig = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ChargeConfig);
let ServiceEntity = class ServiceEntity {
};
exports.ServiceEntity = ServiceEntity;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Business', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ServiceEntity.prototype, "businessId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Branch', default: null, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ServiceEntity.prototype, "branchId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ServiceEntity.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, uppercase: true, maxlength: 8, trim: true }),
    __metadata("design:type", String)
], ServiceEntity.prototype, "code", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], ServiceEntity.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ServiceCategory, default: ServiceCategory.OTHER }),
    __metadata("design:type", String)
], ServiceEntity.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: ChargeConfig, required: true }),
    __metadata("design:type", ChargeConfig)
], ServiceEntity.prototype, "charge", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1, max: 480 }),
    __metadata("design:type", Number)
], ServiceEntity.prototype, "estimatedDuration", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], ServiceEntity.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], ServiceEntity.prototype, "sortOrder", void 0);
exports.ServiceEntity = ServiceEntity = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ServiceEntity);
exports.ServiceSchema = mongoose_1.SchemaFactory.createForClass(ServiceEntity);
exports.ServiceSchema.index({ businessId: 1, isActive: 1 });
exports.ServiceSchema.index({ businessId: 1, branchId: 1 });
//# sourceMappingURL=service.schema.js.map