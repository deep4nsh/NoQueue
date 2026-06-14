import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
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
import { QueueGateway } from '../../gateways/queue.gateway';
import { NotificationService } from '../notification/notification.service';
import { NotificationChannel, NotificationEvent } from '../notification/notification.schema';
import { UserService } from '../user/user.service';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    @InjectModel(TokenEntity.name)
    private readonly tokenModel: Model<TokenDocument>,
    @InjectModel(QueueEntity.name)
    private readonly queueModel: Model<QueueDocument>,
    @InjectModel(ServiceEntity.name)
    private readonly serviceModel: Model<ServiceDocument>,
    private readonly gateway: QueueGateway,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
  ) {}

  async join(dto: JoinTokenDto, userId?: string): Promise<TokenDocument> {
    const queue = await this._getOpenQueue(dto.queueId);
    const service = dto.serviceId
      ? await this.serviceModel.findById(dto.serviceId).exec()
      : null;

    queue.lastTokenIssued += 1;
    await queue.save();

    const displayToken = `${queue.prefix}-${queue.lastTokenIssued}`;
    const waitingTokens = await this._getActiveTokens(queue._id as Types.ObjectId);
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
        userId: userId ? new Types.ObjectId(userId) : null,
      },
      status: TokenStatus.WAITING,
      priority: TokenPriority.NORMAL,
      source: TokenSource.WEB,
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

    this.gateway.emitTokenJoined(dto.queueId, token.toObject());
    this.gateway.emitQueueRefresh(dto.queueId);

    // Trigger FCM notification for token joined
    if (token.customer.userId) {
      try {
        const user = await this.userService.findById(token.customer.userId.toString());
        if (user && user.fcmToken) {
          const notificationPayload = {
            displayToken: token.displayToken,
            position: token.position.toString(),
            estimatedWait: token.estimatedWaitMinutes.toString(),
          };

          await this.notificationService.logNotification(
            token._id.toString(),
            NotificationChannel.FCM,
            NotificationEvent.TOKEN_JOINED,
            user.fcmToken,
            notificationPayload,
          );

          this.notificationService.sendFcmNotification(
            user.fcmToken,
            'Token Added',
            `Your token is ${token.displayToken}. Position: ${token.position}, Est. wait: ${token.estimatedWaitMinutes} mins.`,
            notificationPayload,
          ).catch(err => this.logger.error(`FCM notification failed: ${err.message}`));
        }
      } catch (error) {
        this.logger.error(`Failed to send join notification: ${error.message}`);
      }
    }

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

    this.gateway.emitTokenJoined(dto.queueId, token.toObject());
    this.gateway.emitQueueRefresh(dto.queueId);
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

  async call(id: string): Promise<TokenDocument> {
    const token = await this.findById(id);
    if (token.status !== TokenStatus.WAITING) {
      throw new BadRequestException('Only WAITING tokens can be called');
    }

    token.status = TokenStatus.CALLED;
    token.calledAt = new Date();
    await token.save();

    const queueId = token.queueId.toString();
    this.gateway.emitTokenCalled(queueId, {
      tokenId: id,
      displayToken: token.displayToken,
      customerName: token.customer.name,
    });
    this.gateway.emitQueueRefresh(queueId);

    // Trigger FCM notification if user has FCM token
    if (token.customer.userId) {
      try {
        const user = await this.userService.findById(token.customer.userId.toString());
        if (user && user.fcmToken) {
          const notificationPayload = {
            displayToken: token.displayToken,
            message: `Your turn! Token ${token.displayToken} is being called.`,
          };

          await this.notificationService.logNotification(
            id,
            NotificationChannel.FCM,
            NotificationEvent.CALLED,
            user.fcmToken,
            notificationPayload,
          );

          this.notificationService.sendFcmNotification(
            user.fcmToken,
            'Your Turn!',
            `Token ${token.displayToken} is being called. Please proceed.`,
            notificationPayload,
          ).catch(err => this.logger.error(`FCM notification failed: ${err.message}`));
        }
      } catch (error) {
        this.logger.error(`Failed to send notification: ${error.message}`);
      }
    }

    return token;
  }

  async complete(id: string): Promise<TokenDocument> {
    const token = await this.findById(id);
    const queue = await this.queueModel.findById(token.queueId).exec();
    const avgTime = queue?.averageServiceTime ?? 10;

    token.status = TokenStatus.COMPLETED;
    token.completedAt = new Date();

    if (token.charge && token.charge.status === ChargeStatus.PENDING) {
      token.charge.finalAmount = token.charge.defaultAmount;
      token.charge.status = ChargeStatus.CONFIRMED;
      token.charge.editedAt = new Date();
    }

    await token.save();
    await this._recalculatePositions(token.queueId, avgTime);

    const queueId = token.queueId.toString();
    this.gateway.emitTokenCompleted(queueId, id);
    this.gateway.emitQueueRefresh(queueId);
    return token;
  }

  async skip(id: string): Promise<TokenDocument> {
    const token = await this.findById(id);
    if (![TokenStatus.WAITING, TokenStatus.CALLED].includes(token.status)) {
      throw new BadRequestException('Only WAITING or CALLED tokens can be skipped');
    }

    const queue = await this.queueModel.findById(token.queueId).exec();
    const avgTime = queue?.averageServiceTime ?? 10;

    token.status = TokenStatus.SKIPPED;
    token.skippedAt = new Date();
    await token.save();
    await this._recalculatePositions(token.queueId, avgTime);

    const queueId = token.queueId.toString();
    this.gateway.emitTokenSkipped(queueId, id);
    this.gateway.emitQueueRefresh(queueId);
    return token;
  }

  async cancel(id: string): Promise<TokenDocument> {
    const token = await this.findById(id);
    const queue = await this.queueModel.findById(token.queueId).exec();
    const avgTime = queue?.averageServiceTime ?? 10;

    token.status = TokenStatus.CANCELLED;
    await token.save();
    await this._recalculatePositions(token.queueId, avgTime);

    const queueId = token.queueId.toString();
    this.gateway.emitTokenCancelled(queueId, id);
    this.gateway.emitQueueRefresh(queueId);
    return token;
  }

  async recall(id: string): Promise<{ success: boolean }> {
    const token = await this.findById(id);
    if (token.status !== TokenStatus.CALLED) {
      throw new BadRequestException('Only CALLED tokens can be recalled');
    }

    token.recalledCount = (token.recalledCount ?? 0) + 1;
    await token.save();

    this.gateway.emitTokenCalled(token.queueId.toString(), {
      tokenId: id,
      displayToken: token.displayToken,
      customerName: token.customer.name,
    });
    return { success: true };
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

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private async _getOpenQueue(queueId: string): Promise<QueueDocument> {
    const queue = await this.queueModel.findById(queueId).exec();
    if (!queue) throw new NotFoundException('Queue not found');
    if (queue.status === QueueStatus.CLOSED) {
      throw new BadRequestException('Queue is closed');
    }
    return queue;
  }

  private async _getActiveTokens(queueId: Types.ObjectId): Promise<TokenDocument[]> {
    return this.tokenModel
      .find({ queueId, status: { $in: [TokenStatus.WAITING, TokenStatus.CALLED] } })
      .exec();
  }

  private async _recalculatePositions(
    queueId: Types.ObjectId,
    avgServiceTime: number,
  ): Promise<void> {
    const tokens = await this._getActiveTokens(queueId);
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
