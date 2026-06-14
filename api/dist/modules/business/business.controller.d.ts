import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UserDocument } from '../user/user.schema';
export declare class BusinessController {
    private readonly businessService;
    constructor(businessService: BusinessService);
    create(dto: CreateBusinessDto, user: UserDocument): Promise<import("./business.schema").BusinessDocument>;
    findOne(id: string): Promise<import("./business.schema").BusinessDocument>;
    findBySlug(slug: string): Promise<import("./business.schema").BusinessDocument | {
        error: string;
    }>;
    findAll(user: UserDocument): Promise<import("./business.schema").BusinessDocument[]>;
    update(id: string, updateDto: Partial<CreateBusinessDto>): Promise<import("./business.schema").BusinessDocument>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
