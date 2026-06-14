declare class OpeningHoursDto {
    open: string;
    close: string;
    closed?: boolean;
}
export declare class CreateBranchDto {
    businessId: string;
    name: string;
    address: string;
    location?: {
        type: string;
        coordinates: [number, number];
    };
    phone?: string;
    openingHours?: Record<string, OpeningHoursDto>;
    holidays?: Date[];
    qrCode?: string;
    staff?: string[];
}
export {};
