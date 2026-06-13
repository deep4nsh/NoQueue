import { QueueService } from './queue.service';
import { CreateQueueDto } from './dto/create-queue.dto';
import { UpdateQueueSettingsDto } from './dto/update-queue-settings.dto';
export declare class QueueController {
    private readonly queueService;
    constructor(queueService: QueueService);
    create(dto: CreateQueueDto): Promise<import("./queue.schema").QueueDocument>;
    findByBranch(branchId: string): Promise<Record<string, unknown>>;
    findOne(id: string): Promise<Record<string, unknown>>;
    open(id: string): Promise<import("./queue.schema").QueueDocument>;
    pause(id: string): Promise<import("./queue.schema").QueueDocument>;
    close(id: string): Promise<import("./queue.schema").QueueDocument>;
    updateSettings(id: string, dto: UpdateQueueSettingsDto): Promise<import("./queue.schema").QueueDocument>;
}
