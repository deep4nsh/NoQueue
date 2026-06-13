import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenEntity, TokenSchema } from './token.schema';
import { QueueEntity, QueueSchema } from '../queue/queue.schema';
import { ServiceEntity, ServiceSchema } from '../service/service.schema';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { GatewaysModule } from '../../gateways/gateways.module';

@Module({
  imports: [
    GatewaysModule,
    MongooseModule.forFeature([
      { name: TokenEntity.name, schema: TokenSchema },
      { name: QueueEntity.name, schema: QueueSchema },
      { name: ServiceEntity.name, schema: ServiceSchema },
    ]),
  ],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
