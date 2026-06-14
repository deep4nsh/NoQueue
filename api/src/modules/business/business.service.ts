import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Business, BusinessDocument } from './business.schema';
import { CreateBusinessDto } from './dto/create-business.dto';

@Injectable()
export class BusinessService {
  constructor(@InjectModel(Business.name) private businessModel: Model<BusinessDocument>) {}

  async create(createDto: CreateBusinessDto, ownerUserId: string): Promise<BusinessDocument> {
    const existing = await this.businessModel.findOne({ slug: createDto.slug }).exec();
    if (existing) {
      throw new ConflictException(`Business with slug "${createDto.slug}" already exists`);
    }

    const business = new this.businessModel({
      ...createDto,
      owner: new Types.ObjectId(ownerUserId),
    });
    return business.save();
  }

  async findById(id: string): Promise<BusinessDocument> {
    const business = await this.businessModel.findById(id).exec();
    if (!business) {
      throw new NotFoundException(`Business ${id} not found`);
    }
    return business;
  }

  async findBySlug(slug: string): Promise<BusinessDocument | null> {
    return this.businessModel.findOne({ slug }).exec();
  }

  async findAll(): Promise<BusinessDocument[]> {
    return this.businessModel.find().sort({ createdAt: -1 }).exec();
  }

  async findByOwner(ownerUserId: string): Promise<BusinessDocument[]> {
    return this.businessModel
      .find({ owner: new Types.ObjectId(ownerUserId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, updateData: Partial<CreateBusinessDto>): Promise<BusinessDocument> {
    const business = await this.businessModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!business) {
      throw new NotFoundException(`Business ${id} not found`);
    }
    return business;
  }

  async delete(id: string): Promise<void> {
    const result = await this.businessModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Business ${id} not found`);
    }
  }
}
