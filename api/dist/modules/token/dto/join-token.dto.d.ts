declare class CustomerDto {
    name: string;
    phone?: string;
    email?: string;
}
export declare class JoinTokenDto {
    queueId: string;
    customer: CustomerDto;
    serviceId?: string;
    notes?: string;
}
export {};
