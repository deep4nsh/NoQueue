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
exports.BranchController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const branch_service_1 = require("./branch.service");
const create_branch_dto_1 = require("./dto/create-branch.dto");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const user_schema_1 = require("../user/user.schema");
let BranchController = class BranchController {
    constructor(branchService) {
        this.branchService = branchService;
    }
    async create(dto) {
        return this.branchService.create(dto);
    }
    async findOne(id) {
        return this.branchService.findById(id);
    }
    async findByBusiness(businessId) {
        return this.branchService.findByBusiness(businessId);
    }
    async update(id, updateDto) {
        return this.branchService.update(id, updateDto);
    }
    async delete(id) {
        await this.branchService.delete(id);
        return { success: true };
    }
    async addStaff(id, { staffIds }) {
        return this.branchService.addStaff(id, staffIds);
    }
    async removeStaff(id, staffId) {
        return this.branchService.removeStaff(id, staffId);
    }
    async generateQR(id) {
        const qrCode = await this.branchService.generateQRCode(id);
        return { qrCode };
    }
};
exports.BranchController = BranchController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_schema_1.Role.OWNER, user_schema_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new branch' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_branch_dto_1.CreateBranchDto]),
    __metadata("design:returntype", Promise)
], BranchController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get branch by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BranchController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('business/:businessId'),
    (0, roles_decorator_1.Roles)(user_schema_1.Role.OWNER, user_schema_1.Role.RECEPTIONIST, user_schema_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all branches for a business' }),
    __param(0, (0, common_1.Param)('businessId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BranchController.prototype, "findByBusiness", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_schema_1.Role.OWNER, user_schema_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update branch' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BranchController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_schema_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete branch (soft delete)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BranchController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/staff'),
    (0, roles_decorator_1.Roles)(user_schema_1.Role.OWNER, user_schema_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Add staff to branch' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BranchController.prototype, "addStaff", null);
__decorate([
    (0, common_1.Delete)(':id/staff/:staffId'),
    (0, roles_decorator_1.Roles)(user_schema_1.Role.OWNER, user_schema_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Remove staff from branch' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('staffId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BranchController.prototype, "removeStaff", null);
__decorate([
    (0, common_1.Get)(':id/qr'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Generate QR code for branch' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BranchController.prototype, "generateQR", null);
exports.BranchController = BranchController = __decorate([
    (0, swagger_1.ApiTags)('branch'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('branch'),
    __metadata("design:paramtypes", [branch_service_1.BranchService])
], BranchController);
//# sourceMappingURL=branch.controller.js.map