import { Model } from 'mongoose';
import { ServiceDocument, ServiceCategory } from './service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto, ReorderServicesDto } from './dto/update-service.dto';
export declare class ServiceService {
    private readonly serviceModel;
    constructor(serviceModel: Model<ServiceDocument>);
    create(dto: CreateServiceDto): Promise<ServiceDocument>;
    findAll(businessId: string, branchId?: string): Promise<ServiceDocument[]>;
    findOne(id: string): Promise<ServiceDocument>;
    update(id: string, dto: UpdateServiceDto): Promise<ServiceDocument>;
    remove(id: string): Promise<void>;
    reorder(dto: ReorderServicesDto): Promise<void>;
    findByCategory(businessId: string): Promise<Record<ServiceCategory, ServiceDocument[]>>;
}
