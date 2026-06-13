import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { QueueEntity, QueueDocument, QueueStatus } from './queue.schema';
import { TokenEntity, TokenDocument, TokenStatus } from '../token/token.schema';
import { CreateQueueDto } from './dto/create-queue.dto';
import { UpdateQueueSettingsDto } from './dto/update-queue-settings.dto';

@Injectable()
export class QueueService {
  constructor(
    @InjectModel(QueueEntity.name)
    private readonly queueModel: Model<QueueDocument>,
    @InjectModel(TokenEntity.name)
    private readonly tokenModel: Model<TokenDocument>,
  ) {}

  // ─── Public API ─────────────────────────────────────────────────────────────

  async create(dto: CreateQueueDto): Promise<QueueDocument> {
    // Idempotent — return today's existing queue if already created.
    const existing = await this.queueModel
      .findOne({
        branchId: new Types.ObjectId(dto.branchId),
        date: this._today(),
      })
      .exec();
    if (existing) return existing;

    return this.queueModel.create({
      branchId: new Types.ObjectId(dto.branchId),
      businessId: new Types.ObjectId(dto.businessId),
      name: dto.name,
      prefix: dto.prefix ?? 'A',
      averageServiceTime: dto.averageServiceTime ?? 10,
      status: QueueStatus.OPEN,
      date: this._today(),
    });
  }

  async findByBranch(branchId: string): Promise<Record<string, unknown>> {
    const queue = await this.queueModel
      .findOne({
        branchId: new Types.ObjectId(branchId),
        date: this._today(),
      })
      .exec();

    if (!queue) throw new NotFoundException(`No queue for branch ${branchId} today`);
    return this._withLiveStats(queue);
  }

  async findById(id: string): Promise<Record<string, unknown>> {
    const queue = await this._getQueue(id);
    return this._withLiveStats(queue);
  }

  async open(id: string): Promise<QueueDocument> {
    const queue = await this._getQueue(id);
    if (queue.status === QueueStatus.CLOSED) {
      throw new BadRequestException(
        'A closed queue cannot be re-opened — create a new queue for today.',
      );
    }
    queue.status = QueueStatus.OPEN;
    return queue.save();
  }

  async pause(id: string): Promise<QueueDocument> {
    const queue = await this._getQueue(id);
    if (queue.status === QueueStatus.CLOSED) {
      throw new BadRequestException('Queue is already closed');
    }
    queue.status = QueueStatus.PAUSED;
    return queue.save();
  }

  async close(id: string): Promise<QueueDocument> {
    const queue = await this._getQueue(id);
    queue.status = QueueStatus.CLOSED;
    return queue.save();
  }

  async updateSettings(
    id: string,
    dto: UpdateQueueSettingsDto,
  ): Promise<QueueDocument> {
    const queue = await this._getQueue(id);

    if (dto.averageServiceTime !== undefined)
      queue.averageServiceTime = dto.averageServiceTime;
    if (dto.maxTokens !== undefined)
      queue.settings.maxTokens = dto.maxTokens;
    if (dto.alertAheadCount !== undefined)
      queue.settings.alertAheadCount = dto.alertAheadCount;
    if (dto.allowRemoteJoin !== undefined)
      queue.settings.allowRemoteJoin = dto.allowRemoteJoin;
    if (dto.requirePhone !== undefined)
      queue.settings.requirePhone = dto.requirePhone;
    if (dto.allowEmergencyTokens !== undefined)
      queue.settings.allowEmergencyTokens = dto.allowEmergencyTokens;

    return queue.save();
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private async _getQueue(id: string): Promise<QueueDocument> {
    const queue = await this.queueModel.findById(id).exec();
    if (!queue) throw new NotFoundException('Queue not found');
    return queue;
  }

  private async _withLiveStats(
    queue: QueueDocument,
  ): Promise<Record<string, unknown>> {
    const queueId = queue._id as Types.ObjectId;

    const [waitingCount, calledCount] = await Promise.all([
      this.tokenModel.countDocuments({
        queueId,
        status: TokenStatus.WAITING,
      }),
      this.tokenModel.countDocuments({
        queueId,
        status: TokenStatus.CALLED,
      }),
    ]);

    return { ...queue.toObject(), waitingCount, calledCount };
  }

  private _today(): string {
    return new Date().toISOString().split('T')[0];
  }
}
