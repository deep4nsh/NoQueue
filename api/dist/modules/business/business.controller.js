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
exports.BusinessController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const business_service_1 = require("./business.service");
const create_business_dto_1 = require("./dto/create-business.dto");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const user_schema_1 = require("../user/user.schema");
let BusinessController = class BusinessController {
    constructor(businessService) {
        this.businessService = businessService;
    }
    async create(dto, user) {
        return this.businessService.create(dto, user._id.toString());
    }
    async findOne(id) {
        return this.businessService.findById(id);
    }
    async findBySlug(slug) {
        const business = await this.businessService.findBySlug(slug);
        if (!business) {
            return { error: 'Business not found' };
        }
        return business;
    }
    async findAll(user) {
        if (user.role === user_schema_1.Role.ADMIN) {
            return this.businessService.findAll();
        }
        return this.businessService.findByOwner(user._id.toString());
    }
    async update(id, updateDto) {
        return this.businessService.update(id, updateDto);
    }
    async delete(id) {
        await this.businessService.delete(id);
        return { success: true };
    }
};
exports.BusinessController = BusinessController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_schema_1.Role.OWNER, user_schema_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new business' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_business_dto_1.CreateBusinessDto, Object]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_schema_1.Role.OWNER, user_schema_1.Role.RECEPTIONIST, user_schema_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get business by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('slug/:slug'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get business by slug (for public queue access)' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_schema_1.Role.OWNER, user_schema_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: "Get all businesses owned by current user or all (if admin)" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_schema_1.Role.OWNER, user_schema_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update business' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_schema_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete business (admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "delete", null);
exports.BusinessController = BusinessController = __decorate([
    (0, swagger_1.ApiTags)('business'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('business'),
    __metadata("design:paramtypes", [business_service_1.BusinessService])
], BusinessController);
//# sourceMappingURL=business.controller.js.map