import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
export declare class BranchController {
    private readonly branchService;
    constructor(branchService: BranchService);
    create(dto: CreateBranchDto): Promise<import("./branch.schema").BranchDocument>;
    findOne(id: string): Promise<import("./branch.schema").BranchDocument>;
    findByBusiness(businessId: string): Promise<import("./branch.schema").BranchDocument[]>;
    update(id: string, updateDto: Partial<CreateBranchDto>): Promise<import("./branch.schema").BranchDocument>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
    addStaff(id: string, { staffIds }: {
        staffIds: string[];
    }): Promise<import("./branch.schema").BranchDocument>;
    removeStaff(id: string, staffId: string): Promise<import("./branch.schema").BranchDocument>;
    generateQR(id: string): Promise<{
        qrCode: string;
    }>;
}
