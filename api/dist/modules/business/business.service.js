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
exports.BusinessService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const business_schema_1 = require("./business.schema");
let BusinessService = class BusinessService {
    constructor(businessModel) {
        this.businessModel = businessModel;
    }
    async create(createDto, ownerUserId) {
        const existing = await this.businessModel.findOne({ slug: createDto.slug }).exec();
        if (existing) {
            throw new common_1.ConflictException(`Business with slug "${createDto.slug}" already exists`);
        }
        const business = new this.businessModel({
            ...createDto,
            owner: new mongoose_2.Types.ObjectId(ownerUserId),
        });
        return business.save();
    }
    async findById(id) {
        const business = await this.businessModel.findById(id).exec();
        if (!business) {
            throw new common_1.NotFoundException(`Business ${id} not found`);
        }
        return business;
    }
    async findBySlug(slug) {
        return this.businessModel.findOne({ slug }).exec();
    }
    async findAll() {
        return this.businessModel.find().sort({ createdAt: -1 }).exec();
    }
    async findByOwner(ownerUserId) {
        return this.businessModel
            .find({ owner: new mongoose_2.Types.ObjectId(ownerUserId) })
            .sort({ createdAt: -1 })
            .exec();
    }
    async update(id, updateData) {
        const business = await this.businessModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();
        if (!business) {
            throw new common_1.NotFoundException(`Business ${id} not found`);
        }
        return business;
    }
    async delete(id) {
        const result = await this.businessModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException(`Business ${id} not found`);
        }
    }
};
exports.BusinessService = BusinessService;
exports.BusinessService = BusinessService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(business_schema_1.Business.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], BusinessService);
//# sourceMappingURL=business.service.js.map