declare class EmergencyCustomerDto {
    name: string;
    phone?: string;
}
export declare class EmergencyTokenDto {
    queueId: string;
    customer: EmergencyCustomerDto;
    serviceId?: string;
    reason: string;
    notes?: string;
}
export {};
