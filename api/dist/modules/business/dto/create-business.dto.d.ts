import { BusinessType } from '../business.schema';
export declare class CreateBusinessDto {
    name: string;
    slug: string;
    type?: BusinessType;
    phone: string;
    email: string;
    logoUrl?: string;
    address: string;
    country?: string;
    timezone?: string;
}
