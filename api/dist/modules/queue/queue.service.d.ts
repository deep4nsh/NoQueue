import { Model } from 'mongoose';
import { QueueDocument } from './queue.schema';
import { TokenDocument } from '../token/token.schema';
import { CreateQueueDto } from './dto/create-queue.dto';
import { UpdateQueueSettingsDto } from './dto/update-queue-settings.dto';
export declare class QueueService {
    private readonly queueModel;
    private readonly tokenModel;
    constructor(queueModel: Model<QueueDocument>, tokenModel: Model<TokenDocument>);
    create(dto: CreateQueueDto): Promise<QueueDocument>;
    findByBranch(branchId: string): Promise<Record<string, unknown>>;
    findById(id: string): Promise<Record<string, unknown>>;
    open(id: string): Promise<QueueDocument>;
    pause(id: string): Promise<QueueDocument>;
    close(id: string): Promise<QueueDocument>;
    updateSettings(id: string, dto: UpdateQueueSettingsDto): Promise<QueueDocument>;
    private _getQueue;
    private _withLiveStats;
    private _today;
}
