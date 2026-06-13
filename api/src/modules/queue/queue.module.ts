import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QueueEntity, QueueSchema } from './queue.schema';
import { TokenEntity, TokenSchema } from '../token/token.schema';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { GatewaysModule } from '../../gateways/gateways.module';

@Module({
  imports: [
    GatewaysModule,
    MongooseModule.forFeature([
      { name: QueueEntity.name, schema: QueueSchema },
      { name: TokenEntity.name, schema: TokenSchema },
    ]),
  ],
  controllers: [QueueController],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
