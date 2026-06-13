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
exports.ServiceService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const service_schema_1 = require("./service.schema");
let ServiceService = class ServiceService {
    constructor(serviceModel) {
        this.serviceModel = serviceModel;
    }
    async create(dto) {
        const code = dto.code.toUpperCase();
        const existing = await this.serviceModel.findOne({
            businessId: new mongoose_2.Types.ObjectId(dto.businessId),
            code,
        });
        if (existing) {
            throw new common_1.BadRequestException(`Service code "${code}" already exists for this business`);
        }
        const count = await this.serviceModel.countDocuments({
            businessId: new mongoose_2.Types.ObjectId(dto.businessId),
        });
        return this.serviceModel.create({
            ...dto,
            code,
            businessId: new mongoose_2.Types.ObjectId(dto.businessId),
            branchId: dto.branchId ? new mongoose_2.Types.ObjectId(dto.branchId) : null,
            sortOrder: dto.sortOrder ?? count,
        });
    }
    async findAll(businessId, branchId) {
        const query = {
            businessId: new mongoose_2.Types.ObjectId(businessId),
        };
        if (branchId) {
            query.$or = [
                { branchId: new mongoose_2.Types.ObjectId(branchId) },
                { branchId: null },
            ];
        }
        return this.serviceModel
            .find(query)
            .sort({ sortOrder: 1, createdAt: 1 })
            .exec();
    }
    async findOne(id) {
        const service = await this.serviceModel.findById(id).exec();
        if (!service)
            throw new common_1.NotFoundException('Service not found');
        return service;
    }
    async update(id, dto) {
        if (dto.code) {
            const service = await this.findOne(id);
            const code = dto.code.toUpperCase();
            const conflict = await this.serviceModel.findOne({
                businessId: service.businessId,
                code,
                _id: { $ne: new mongoose_2.Types.ObjectId(id) },
            });
            if (conflict) {
                throw new common_1.BadRequestException(`Service code "${code}" already exists for this business`);
            }
            dto.code = code;
        }
        const updated = await this.serviceModel
            .findByIdAndUpdate(id, { $set: dto }, { new: true })
            .exec();
        if (!updated)
            throw new common_1.NotFoundException('Service not found');
        return updated;
    }
    async remove(id) {
        const result = await this.serviceModel
            .findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true })
            .exec();
        if (!result)
            throw new common_1.NotFoundException('Service not found');
    }
    async reorder(dto) {
        const ops = dto.ids.map((id, index) => this.serviceModel.updateOne({ _id: new mongoose_2.Types.ObjectId(id) }, { $set: { sortOrder: index } }));
        await Promise.all(ops);
    }
    async findByCategory(businessId) {
        const services = await this.findAll(businessId);
        const grouped = {};
        for (const cat of Object.values(service_schema_1.ServiceCategory)) {
            grouped[cat] = [];
        }
        for (const s of services) {
            grouped[s.category].push(s);
        }
        return grouped;
    }
};
exports.ServiceService = ServiceService;
exports.ServiceService = ServiceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(service_schema_1.ServiceEntity.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ServiceService);
//# sourceMappingURL=service.service.js.map