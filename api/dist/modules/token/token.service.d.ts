import { Model } from 'mongoose';
import { TokenDocument, TokenStatus } from './token.schema';
import { QueueDocument } from '../queue/queue.schema';
import { ServiceDocument } from '../service/service.schema';
import { JoinTokenDto } from './dto/join-token.dto';
import { EmergencyTokenDto } from './dto/emergency-token.dto';
import { UpdateChargeDto } from './dto/update-charge.dto';
export declare class TokenService {
    private readonly tokenModel;
    private readonly queueModel;
    private readonly serviceModel;
    constructor(tokenModel: Model<TokenDocument>, queueModel: Model<QueueDocument>, serviceModel: Model<ServiceDocument>);
    join(dto: JoinTokenDto): Promise<TokenDocument>;
    createEmergency(dto: EmergencyTokenDto): Promise<TokenDocument>;
    findById(id: string): Promise<TokenDocument>;
    getQueueTokens(queueId: string, status?: TokenStatus[]): Promise<TokenDocument[]>;
    complete(id: string): Promise<TokenDocument>;
    cancel(id: string): Promise<TokenDocument>;
    updateCharge(id: string, dto: UpdateChargeDto): Promise<TokenDocument>;
    private _getOpenQueue;
    private _getWaitingTokens;
    private _recalculatePositions;
    private _sortByPriorityThenTime;
    private _snapshotService;
}
