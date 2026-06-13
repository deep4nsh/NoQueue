import { ChargeStatus } from '../token.schema';
export declare class UpdateChargeDto {
    finalAmount?: number;
    status: ChargeStatus.CONFIRMED | ChargeStatus.WAIVED;
    notes?: string;
}
