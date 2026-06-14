import { Model } from 'mongoose';
import { TokenDocument, TokenStatus } from './token.schema';
import { QueueDocument } from '../queue/queue.schema';
import { ServiceDocument } from '../service/service.schema';
import { JoinTokenDto } from './dto/join-token.dto';
import { EmergencyTokenDto } from './dto/emergency-token.dto';
import { UpdateChargeDto } from './dto/update-charge.dto';
import { QueueGateway } from '../../gateways/queue.gateway';
export declare class TokenService {
    private readonly tokenModel;
    private readonly queueModel;
    private readonly serviceModel;
    private readonly gateway;
    constructor(tokenModel: Model<TokenDocument>, queueModel: Model<QueueDocument>, serviceModel: Model<ServiceDocument>, gateway: QueueGateway);
    join(dto: JoinTokenDto, userId?: string): Promise<TokenDocument>;
    createEmergency(dto: EmergencyTokenDto): Promise<TokenDocument>;
    findById(id: string): Promise<TokenDocument>;
    getQueueTokens(queueId: string, status?: TokenStatus[]): Promise<TokenDocument[]>;
    call(id: string): Promise<TokenDocument>;
    complete(id: string): Promise<TokenDocument>;
    skip(id: string): Promise<TokenDocument>;
    cancel(id: string): Promise<TokenDocument>;
    recall(id: string): Promise<{
        success: boolean;
    }>;
    updateCharge(id: string, dto: UpdateChargeDto): Promise<TokenDocument>;
    private _getOpenQueue;
    private _getActiveTokens;
    private _recalculatePositions;
    private _sortByPriorityThenTime;
    private _snapshotService;
}
