import { Model } from 'mongoose';
import { BranchDocument } from './branch.schema';
import { CreateBranchDto } from './dto/create-branch.dto';
export declare class BranchService {
    private branchModel;
    constructor(branchModel: Model<BranchDocument>);
    create(createDto: CreateBranchDto): Promise<BranchDocument>;
    findById(id: string): Promise<BranchDocument>;
    findByBusiness(businessId: string): Promise<BranchDocument[]>;
    findAll(): Promise<BranchDocument[]>;
    update(id: string, updateData: Partial<CreateBranchDto>): Promise<BranchDocument>;
    delete(id: string): Promise<void>;
    addStaff(branchId: string, staffIds: string[]): Promise<BranchDocument>;
    removeStaff(branchId: string, staffId: string): Promise<BranchDocument>;
    private getDefaultOpeningHours;
    generateQRCode(branchId: string): Promise<string>;
}
