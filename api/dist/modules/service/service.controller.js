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
exports.ServiceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const service_service_1 = require("./service.service");
const create_service_dto_1 = require("./dto/create-service.dto");
const update_service_dto_1 = require("./dto/update-service.dto");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_schema_1 = require("../user/user.schema");
let ServiceController = class ServiceController {
    constructor(serviceService) {
        this.serviceService = serviceService;
    }
    create(dto) {
        return this.serviceService.create(dto);
    }
    findAll(businessId, branchId) {
        return this.serviceService.findAll(businessId, branchId);
    }
    findGrouped(businessId) {
        return this.serviceService.findByCategory(businessId);
    }
    findOne(id) {
        return this.serviceService.findOne(id);
    }
    reorder(dto) {
        return this.serviceService.reorder(dto);
    }
    update(id, dto) {
        return this.serviceService.update(id, dto);
    }
    remove(id) {
        return this.serviceService.remove(id);
    }
};
exports.ServiceController = ServiceController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_schema_1.Role.OWNER, user_schema_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a service for a business' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_service_dto_1.CreateServiceDto]),
    __metadata("design:returntype", void 0)
], ServiceController.prototype, "create", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List services for a business, optionally filtered by branch' }),
    (0, swagger_1.ApiQuery)({ name: 'businessId', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'branchId', required: false }),
    __param(0, (0, common_1.Query)('businessId')),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ServiceController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('grouped'),
    (0, swagger_1.ApiOperation)({ summary: 'List services grouped by category' }),
    (0, swagger_1.ApiQuery)({ name: 'businessId', required: true }),
    __param(0, (0, common_1.Query)('businessId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServiceController.prototype, "findGrouped", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single service by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServiceController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('reorder'),
    (0, roles_decorator_1.Roles)(user_schema_1.Role.OWNER, user_schema_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder services by providing an ordered array of IDs' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_service_dto_1.ReorderServicesDto]),
    __metadata("design:returntype", void 0)
], ServiceController.prototype, "reorder", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_schema_1.Role.OWNER, user_schema_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update a service' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_service_dto_1.UpdateServiceDto]),
    __metadata("design:returntype", void 0)
], ServiceController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_schema_1.Role.OWNER, user_schema_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete a service (sets isActive = false)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServiceController.prototype, "remove", null);
exports.ServiceController = ServiceController = __decorate([
    (0, swagger_1.ApiTags)('service'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('service'),
    __metadata("design:paramtypes", [service_service_1.ServiceService])
], ServiceController);
//# sourceMappingURL=service.controller.js.map