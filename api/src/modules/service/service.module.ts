import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceEntity, ServiceSchema } from './service.schema';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ServiceEntity.name, schema: ServiceSchema }]),
  ],
  controllers: [ServiceController],
  providers: [ServiceService],
  exports: [ServiceService],
})
export class ServiceModule {}
