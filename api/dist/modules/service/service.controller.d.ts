import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto, ReorderServicesDto } from './dto/update-service.dto';
export declare class ServiceController {
    private readonly serviceService;
    constructor(serviceService: ServiceService);
    create(dto: CreateServiceDto): Promise<import("./service.schema").ServiceDocument>;
    findAll(businessId: string, branchId?: string): Promise<import("./service.schema").ServiceDocument[]>;
    findGrouped(businessId: string): Promise<Record<import("./service.schema").ServiceCategory, import("./service.schema").ServiceDocument[]>>;
    findOne(id: string): Promise<import("./service.schema").ServiceDocument>;
    reorder(dto: ReorderServicesDto): Promise<void>;
    update(id: string, dto: UpdateServiceDto): Promise<import("./service.schema").ServiceDocument>;
    remove(id: string): Promise<void>;
}
