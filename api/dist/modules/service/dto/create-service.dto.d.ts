import { ServiceCategory } from '../service.schema';
declare class CreateChargeDto {
    amount: number;
    currency?: string;
    isEditable?: boolean;
    minAmount?: number;
    maxAmount?: number;
}
export declare class CreateServiceDto {
    businessId: string;
    branchId?: string;
    name: string;
    code: string;
    description?: string;
    category?: ServiceCategory;
    charge: CreateChargeDto;
    estimatedDuration: number;
    isActive?: boolean;
    sortOrder?: number;
}
export {};
