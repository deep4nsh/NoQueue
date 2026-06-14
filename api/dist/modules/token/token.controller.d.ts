import { TokenService } from './token.service';
import { JoinTokenDto } from './dto/join-token.dto';
import { EmergencyTokenDto } from './dto/emergency-token.dto';
import { UpdateChargeDto } from './dto/update-charge.dto';
import { TokenStatus } from './token.schema';
import { UserDocument } from '../user/user.schema';
export declare class TokenController {
    private readonly tokenService;
    constructor(tokenService: TokenService);
    join(dto: JoinTokenDto, user?: UserDocument): Promise<import("./token.schema").TokenDocument>;
    createEmergency(dto: EmergencyTokenDto): Promise<import("./token.schema").TokenDocument>;
    getQueueTokens(queueId: string, status?: TokenStatus | TokenStatus[]): Promise<import("./token.schema").TokenDocument[]>;
    findOne(id: string): Promise<import("./token.schema").TokenDocument>;
    call(id: string): Promise<import("./token.schema").TokenDocument>;
    complete(id: string): Promise<import("./token.schema").TokenDocument>;
    skip(id: string): Promise<import("./token.schema").TokenDocument>;
    recall(id: string): Promise<{
        success: boolean;
    }>;
    cancel(id: string): Promise<import("./token.schema").TokenDocument>;
    updateCharge(id: string, dto: UpdateChargeDto): Promise<import("./token.schema").TokenDocument>;
}
