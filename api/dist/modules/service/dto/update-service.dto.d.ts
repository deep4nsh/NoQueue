import { ServiceCategory } from '../service.schema';
declare class UpdateChargeDto {
    amount?: number;
    currency?: string;
    isEditable?: boolean;
    minAmount?: number;
    maxAmount?: number;
}
export declare class UpdateServiceDto {
    name?: string;
    code?: string;
    description?: string;
    category?: ServiceCategory;
    charge?: UpdateChargeDto;
    estimatedDuration?: number;
    isActive?: boolean;
    sortOrder?: number;
}
export declare class ReorderServicesDto {
    ids: string[];
}
export {};
