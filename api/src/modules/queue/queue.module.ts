import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QueueEntity, QueueSchema } from './queue.schema';
import { TokenEntity, TokenSchema } from '../token/token.schema';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QueueEntity.name, schema: QueueSchema },
      // TokenEntity is needed for live waitingCount/calledCount in findById.
      // Registering the same model in multiple modules is safe in NestJS/Mongoose.
      { name: TokenEntity.name, schema: TokenSchema },
    ]),
  ],
  controllers: [QueueController],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
