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
exports.BranchService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const branch_schema_1 = require("./branch.schema");
const qrcode_1 = require("qrcode");
let BranchService = class BranchService {
    constructor(branchModel) {
        this.branchModel = branchModel;
    }
    async create(createDto) {
        if (!mongoose_2.Types.ObjectId.isValid(createDto.businessId)) {
            throw new common_1.BadRequestException('Invalid businessId');
        }
        const qrCodeUrl = `noqueue.app/join/${createDto.businessId}`;
        const branch = new this.branchModel({
            businessId: new mongoose_2.Types.ObjectId(createDto.businessId),
            name: createDto.name,
            address: createDto.address,
            phone: createDto.phone,
            location: createDto.location || { type: 'Point', coordinates: [0, 0] },
            openingHours: createDto.openingHours || this.getDefaultOpeningHours(),
            holidays: createDto.holidays || [],
            qrCode: qrCodeUrl,
            staff: (createDto.staff || []).map(id => new mongoose_2.Types.ObjectId(id)),
            isActive: true,
        });
        return branch.save();
    }
    async findById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid branch ID');
        }
        const branch = await this.branchModel.findById(id).exec();
        if (!branch) {
            throw new common_1.NotFoundException(`Branch ${id} not found`);
        }
        return branch;
    }
    async findByBusiness(businessId) {
        if (!mongoose_2.Types.ObjectId.isValid(businessId)) {
            throw new common_1.BadRequestException('Invalid businessId');
        }
        return this.branchModel
            .find({ businessId: new mongoose_2.Types.ObjectId(businessId), isActive: true })
            .sort({ createdAt: -1 })
            .exec();
    }
    async findAll() {
        return this.branchModel.find({ isActive: true }).sort({ createdAt: -1 }).exec();
    }
    async update(id, updateData) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid branch ID');
        }
        const branch = await this.branchModel
            .findByIdAndUpdate(id, {
            ...updateData,
            businessId: updateData.businessId
                ? new mongoose_2.Types.ObjectId(updateData.businessId)
                : undefined,
            staff: updateData.staff ? updateData.staff.map(id => new mongoose_2.Types.ObjectId(id)) : undefined,
        }, { new: true })
            .exec();
        if (!branch) {
            throw new common_1.NotFoundException(`Branch ${id} not found`);
        }
        return branch;
    }
    async delete(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid branch ID');
        }
        const result = await this.branchModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
        if (!result) {
            throw new common_1.NotFoundException(`Branch ${id} not found`);
        }
    }
    async addStaff(branchId, staffIds) {
        if (!mongoose_2.Types.ObjectId.isValid(branchId)) {
            throw new common_1.BadRequestException('Invalid branch ID');
        }
        const objectIds = staffIds.map(id => new mongoose_2.Types.ObjectId(id));
        const branch = await this.branchModel
            .findByIdAndUpdate(branchId, { $addToSet: { staff: { $each: objectIds } } }, { new: true })
            .exec();
        if (!branch) {
            throw new common_1.NotFoundException(`Branch ${branchId} not found`);
        }
        return branch;
    }
    async removeStaff(branchId, staffId) {
        if (!mongoose_2.Types.ObjectId.isValid(branchId)) {
            throw new common_1.BadRequestException('Invalid branch ID');
        }
        const branch = await this.branchModel
            .findByIdAndUpdate(branchId, { $pull: { staff: new mongoose_2.Types.ObjectId(staffId) } }, { new: true })
            .exec();
        if (!branch) {
            throw new common_1.NotFoundException(`Branch ${branchId} not found`);
        }
        return branch;
    }
    getDefaultOpeningHours() {
        const hours = new Map();
        const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        const isWeekend = (day) => ['sat', 'sun'].includes(day);
        days.forEach(day => {
            hours.set(day, {
                open: '09:00',
                close: '18:00',
                closed: isWeekend(day),
            });
        });
        return hours;
    }
    async generateQRCode(branchId) {
        const branch = await this.findById(branchId);
        const qrUrl = `https://noqueue.app/join/${branch.businessId}`;
        return qrcode_1.default.toDataURL(qrUrl);
    }
};
exports.BranchService = BranchService;
exports.BranchService = BranchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(branch_schema_1.Branch.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], BranchService);
//# sourceMappingURL=branch.service.js.map