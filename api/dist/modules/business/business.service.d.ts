import { Model } from 'mongoose';
import { BusinessDocument } from './business.schema';
import { CreateBusinessDto } from './dto/create-business.dto';
export declare class BusinessService {
    private businessModel;
    constructor(businessModel: Model<BusinessDocument>);
    create(createDto: CreateBusinessDto, ownerUserId: string): Promise<BusinessDocument>;
    findById(id: string): Promise<BusinessDocument>;
    findBySlug(slug: string): Promise<BusinessDocument | null>;
    findAll(): Promise<BusinessDocument[]>;
    findByOwner(ownerUserId: string): Promise<BusinessDocument[]>;
    update(id: string, updateData: Partial<CreateBusinessDto>): Promise<BusinessDocument>;
    delete(id: string): Promise<void>;
}
