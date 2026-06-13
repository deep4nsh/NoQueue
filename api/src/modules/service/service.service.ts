import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ServiceEntity, ServiceDocument, ServiceCategory } from './service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto, ReorderServicesDto } from './dto/update-service.dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(ServiceEntity.name)
    private readonly serviceModel: Model<ServiceDocument>,
  ) {}

  async create(dto: CreateServiceDto): Promise<ServiceDocument> {
    const code = dto.code.toUpperCase();
    const existing = await this.serviceModel.findOne({
      businessId: new Types.ObjectId(dto.businessId),
      code,
    });
    if (existing) {
      throw new BadRequestException(`Service code "${code}" already exists for this business`);
    }

    const count = await this.serviceModel.countDocuments({
      businessId: new Types.ObjectId(dto.businessId),
    });

    return this.serviceModel.create({
      ...dto,
      code,
      businessId: new Types.ObjectId(dto.businessId),
      branchId: dto.branchId ? new Types.ObjectId(dto.branchId) : null,
      sortOrder: dto.sortOrder ?? count,
    });
  }

  async findAll(businessId: string, branchId?: string): Promise<ServiceDocument[]> {
    const query: Record<string, any> = {
      businessId: new Types.ObjectId(businessId),
    };

    if (branchId) {
      query.$or = [
        { branchId: new Types.ObjectId(branchId) },
        { branchId: null },
      ];
    }

    return this.serviceModel
      .find(query)
      .sort({ sortOrder: 1, createdAt: 1 })
      .exec();
  }

  async findOne(id: string): Promise<ServiceDocument> {
    const service = await this.serviceModel.findById(id).exec();
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async update(id: string, dto: UpdateServiceDto): Promise<ServiceDocument> {
    if (dto.code) {
      const service = await this.findOne(id);
      const code = dto.code.toUpperCase();
      const conflict = await this.serviceModel.findOne({
        businessId: service.businessId,
        code,
        _id: { $ne: new Types.ObjectId(id) },
      });
      if (conflict) {
        throw new BadRequestException(`Service code "${code}" already exists for this business`);
      }
      dto.code = code;
    }

    const updated = await this.serviceModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Service not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.serviceModel
      .findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true })
      .exec();
    if (!result) throw new NotFoundException('Service not found');
  }

  async reorder(dto: ReorderServicesDto): Promise<void> {
    const ops = dto.ids.map((id, index) =>
      this.serviceModel.updateOne({ _id: new Types.ObjectId(id) }, { $set: { sortOrder: index } }),
    );
    await Promise.all(ops);
  }

  async findByCategory(businessId: string): Promise<Record<ServiceCategory, ServiceDocument[]>> {
    const services = await this.findAll(businessId);
    const grouped = {} as Record<ServiceCategory, ServiceDocument[]>;

    for (const cat of Object.values(ServiceCategory)) {
      grouped[cat] = [];
    }

    for (const s of services) {
      grouped[s.category as ServiceCategory].push(s);
    }

    return grouped;
  }
}
