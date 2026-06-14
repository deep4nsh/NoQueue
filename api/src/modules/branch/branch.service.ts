import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Branch, BranchDocument } from './branch.schema';
import { CreateBranchDto } from './dto/create-branch.dto';
import QRCode from 'qrcode';

@Injectable()
export class BranchService {
  constructor(@InjectModel(Branch.name) private branchModel: Model<BranchDocument>) {}

  async create(createDto: CreateBranchDto): Promise<BranchDocument> {
    if (!Types.ObjectId.isValid(createDto.businessId)) {
      throw new BadRequestException('Invalid businessId');
    }

    const qrCodeUrl = `noqueue.app/join/${createDto.businessId}`;

    const branch = new this.branchModel({
      businessId: new Types.ObjectId(createDto.businessId),
      name: createDto.name,
      address: createDto.address,
      phone: createDto.phone,
      location: createDto.location || { type: 'Point', coordinates: [0, 0] },
      openingHours: createDto.openingHours || this.getDefaultOpeningHours(),
      holidays: createDto.holidays || [],
      qrCode: qrCodeUrl,
      staff: (createDto.staff || []).map(id => new Types.ObjectId(id)),
      isActive: true,
    });

    return branch.save();
  }

  async findById(id: string): Promise<BranchDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid branch ID');
    }

    const branch = await this.branchModel.findById(id).exec();
    if (!branch) {
      throw new NotFoundException(`Branch ${id} not found`);
    }
    return branch;
  }

  async findByBusiness(businessId: string): Promise<BranchDocument[]> {
    if (!Types.ObjectId.isValid(businessId)) {
      throw new BadRequestException('Invalid businessId');
    }

    return this.branchModel
      .find({ businessId: new Types.ObjectId(businessId), isActive: true })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAll(): Promise<BranchDocument[]> {
    return this.branchModel.find({ isActive: true }).sort({ createdAt: -1 }).exec();
  }

  async update(id: string, updateData: Partial<CreateBranchDto>): Promise<BranchDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid branch ID');
    }

    const branch = await this.branchModel
      .findByIdAndUpdate(
        id,
        {
          ...updateData,
          businessId: updateData.businessId
            ? new Types.ObjectId(updateData.businessId)
            : undefined,
          staff: updateData.staff ? updateData.staff.map(id => new Types.ObjectId(id)) : undefined,
        },
        { new: true },
      )
      .exec();

    if (!branch) {
      throw new NotFoundException(`Branch ${id} not found`);
    }
    return branch;
  }

  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid branch ID');
    }

    const result = await this.branchModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
    if (!result) {
      throw new NotFoundException(`Branch ${id} not found`);
    }
  }

  async addStaff(branchId: string, staffIds: string[]): Promise<BranchDocument> {
    if (!Types.ObjectId.isValid(branchId)) {
      throw new BadRequestException('Invalid branch ID');
    }

    const objectIds = staffIds.map(id => new Types.ObjectId(id));
    const branch = await this.branchModel
      .findByIdAndUpdate(
        branchId,
        { $addToSet: { staff: { $each: objectIds } } },
        { new: true },
      )
      .exec();

    if (!branch) {
      throw new NotFoundException(`Branch ${branchId} not found`);
    }
    return branch;
  }

  async removeStaff(branchId: string, staffId: string): Promise<BranchDocument> {
    if (!Types.ObjectId.isValid(branchId)) {
      throw new BadRequestException('Invalid branch ID');
    }

    const branch = await this.branchModel
      .findByIdAndUpdate(
        branchId,
        { $pull: { staff: new Types.ObjectId(staffId) } },
        { new: true },
      )
      .exec();

    if (!branch) {
      throw new NotFoundException(`Branch ${branchId} not found`);
    }
    return branch;
  }

  private getDefaultOpeningHours(): Map<string, { open: string; close: string; closed: boolean }> {
    const hours = new Map();
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const isWeekend = (day: string) => ['sat', 'sun'].includes(day);

    days.forEach(day => {
      hours.set(day, {
        open: '09:00',
        close: '18:00',
        closed: isWeekend(day),
      });
    });
    return hours;
  }

  async generateQRCode(branchId: string): Promise<string> {
    const branch = await this.findById(branchId);
    const qrUrl = `https://noqueue.app/join/${branch.businessId}`;
    return QRCode.toDataURL(qrUrl);
  }
}
