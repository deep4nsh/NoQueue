import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  TokenEntity,
  TokenDocument,
  TokenPriority,
  TokenStatus,
  TokenSource,
  ChargeStatus,
} from './token.schema';
import { QueueEntity, QueueDocument, QueueStatus } from '../queue/queue.schema';
import { ServiceEntity, ServiceDocument } from '../service/service.schema';
import { JoinTokenDto } from './dto/join-token.dto';
import { EmergencyTokenDto } from './dto/emergency-token.dto';
import { UpdateChargeDto } from './dto/update-charge.dto';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(TokenEntity.name)
    private readonly tokenModel: Model<TokenDocument>,
    @InjectModel(QueueEntity.name)
    private readonly queueModel: Model<QueueDocument>,
    @InjectModel(ServiceEntity.name)
    private readonly serviceModel: Model<ServiceDocument>,
  ) {}

  async join(dto: JoinTokenDto): Promise<TokenDocument> {
    const queue = await this._getOpenQueue(dto.queueId);
    const service = dto.serviceId
      ? await this.serviceModel.findById(dto.serviceId).exec()
      : null;

    queue.lastTokenIssued += 1;
    await queue.save();

    const displayToken = `${queue.prefix}-${queue.lastTokenIssued}`;
    const waitingTokens = await this._getWaitingTokens(queue._id as Types.ObjectId);
    const position = waitingTokens.length + 1;
    const estimatedWait = position * queue.averageServiceTime;

    const token = await this.tokenModel.create({
      queueId: queue._id,
      branchId: queue.branchId,
      businessId: queue.businessId,
      tokenNumber: queue.lastTokenIssued,
      displayToken,
      customer: {
        name: dto.customer.name,
        phone: dto.customer.phone ?? null,
        email: null,
        userId: null,
      },
      status: TokenStatus.WAITING,
      priority: TokenPriority.NORMAL,
      source: TokenSource.RECEPTIONIST,
      position,
      estimatedWaitMinutes: estimatedWait,
      service: service ? this._snapshotService(service) : null,
      charge: service
        ? {
            defaultAmount: service.charge.amount,
            finalAmount: null,
            currency: service.charge.currency,
            status: ChargeStatus.PENDING,
            editedBy: null,
            editedAt: null,
          }
        : null,
      notes: dto.notes ?? '',
      joinedAt: new Date(),
    });

    return token;
  }

  async createEmergency(dto: EmergencyTokenDto): Promise<TokenDocument> {
    const queue = await this._getOpenQueue(dto.queueId);

    if (!queue.settings.allowEmergencyTokens) {
      throw new BadRequestException('Emergency tokens are not enabled on this queue');
    }

    const service = dto.serviceId
      ? await this.serviceModel.findById(dto.serviceId).exec()
      : null;

    queue.lastEmergencyTokenIssued += 1;
    await queue.save();

    const displayToken = `E-${String(queue.lastEmergencyTokenIssued).padStart(3, '0')}`;

    const token = await this.tokenModel.create({
      queueId: queue._id,
      branchId: queue.branchId,
      businessId: queue.businessId,
      tokenNumber: queue.lastEmergencyTokenIssued,
      displayToken,
      customer: {
        name: dto.customer.name,
        phone: dto.customer.phone ?? null,
        email: null,
        userId: null,
      },
      status: TokenStatus.WAITING,
      priority: TokenPriority.EMERGENCY,
      priorityReason: dto.reason,
      source: TokenSource.EMERGENCY,
      position: 1,
      estimatedWaitMinutes: queue.averageServiceTime,
      service: service ? this._snapshotService(service) : null,
      charge: service
        ? {
            defaultAmount: service.charge.amount,
            finalAmount: null,
            currency: service.charge.currency,
            status: ChargeStatus.PENDING,
            editedBy: null,
            editedAt: null,
          }
        : null,
      notes: dto.notes ?? '',
      joinedAt: new Date(),
    });

    await this._recalculatePositions(queue._id as Types.ObjectId, queue.averageServiceTime);

    return token;
  }

  async findById(id: string): Promise<TokenDocument> {
    const token = await this.tokenModel.findById(id).exec();
    if (!token) throw new NotFoundException('Token not found');
    return token;
  }

  async getQueueTokens(
    queueId: string,
    status?: TokenStatus[],
  ): Promise<TokenDocument[]> {
    const filter: Record<string, any> = { queueId: new Types.ObjectId(queueId) };
    if (status?.length) {
      filter.status = { $in: status };
    }
    const tokens = await this.tokenModel.find(filter).exec();
    return this._sortByPriorityThenTime(tokens);
  }

  async complete(id: string): Promise<TokenDocument> {
    const token = await this.findById(id);
    const queue = await this.queueModel.findById(token.queueId).exec();
    const avgTime = queue?.averageServiceTime ?? 10;

    token.status = TokenStatus.COMPLETED;
    token.completedAt = new Date();

    // Auto-confirm a still-pending charge with the default amount
    if (token.charge && token.charge.status === ChargeStatus.PENDING) {
      token.charge.finalAmount = token.charge.defaultAmount;
      token.charge.status = ChargeStatus.CONFIRMED;
      token.charge.editedAt = new Date();
    }

    await token.save();
    await this._recalculatePositions(token.queueId, avgTime);
    return token;
  }

  async cancel(id: string): Promise<TokenDocument> {
    const token = await this.findById(id);
    const queue = await this.queueModel.findById(token.queueId).exec();
    const avgTime = queue?.averageServiceTime ?? 10;

    token.status = TokenStatus.CANCELLED;
    await token.save();
    await this._recalculatePositions(token.queueId, avgTime);
    return token;
  }

  async updateCharge(id: string, dto: UpdateChargeDto): Promise<TokenDocument> {
    const token = await this.findById(id);

    if (!token.charge) {
      throw new BadRequestException('This token has no charge information');
    }

    if (dto.finalAmount !== undefined && token.service?.serviceId) {
      const service = await this.serviceModel.findById(token.service.serviceId).exec();
      if (service) {
        if (!service.charge.isEditable) {
          throw new BadRequestException('Charge is not editable for this service');
        }
        if (service.charge.minAmount !== null && dto.finalAmount < service.charge.minAmount) {
          throw new BadRequestException(
            `Charge cannot be less than ₹${service.charge.minAmount / 100}`,
          );
        }
        if (service.charge.maxAmount !== null && dto.finalAmount > service.charge.maxAmount) {
          throw new BadRequestException(
            `Charge cannot exceed ₹${service.charge.maxAmount / 100}`,
          );
        }
      }
    }

    token.charge.finalAmount = dto.finalAmount ?? token.charge.defaultAmount;
    token.charge.status = dto.status as ChargeStatus;
    token.charge.editedAt = new Date();
    await token.save();
    return token;
  }

  private async _getOpenQueue(queueId: string): Promise<QueueDocument> {
    const queue = await this.queueModel.findById(queueId).exec();
    if (!queue) throw new NotFoundException('Queue not found');
    if (queue.status === QueueStatus.CLOSED) {
      throw new BadRequestException('Queue is closed');
    }
    return queue;
  }

  private async _getWaitingTokens(queueId: Types.ObjectId): Promise<TokenDocument[]> {
    return this.tokenModel
      .find({ queueId, status: { $in: [TokenStatus.WAITING, TokenStatus.CALLED] } })
      .exec();
  }

  private async _recalculatePositions(
    queueId: Types.ObjectId,
    avgServiceTime: number,
  ): Promise<void> {
    const tokens = await this._getWaitingTokens(queueId);
    const sorted = this._sortByPriorityThenTime(tokens);

    const ops = sorted.map((token, index) =>
      this.tokenModel.updateOne(
        { _id: token._id },
        {
          $set: {
            position: index + 1,
            estimatedWaitMinutes: (index + 1) * avgServiceTime,
          },
        },
      ),
    );
    await Promise.all(ops);
  }

  private _sortByPriorityThenTime(tokens: TokenDocument[]): TokenDocument[] {
    return [...tokens].sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority === TokenPriority.EMERGENCY ? -1 : 1;
      }
      return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
    });
  }

  private _snapshotService(service: ServiceDocument) {
    return {
      serviceId: service._id,
      name: service.name,
      code: service.code,
      estimatedDuration: service.estimatedDuration,
    };
  }
}
