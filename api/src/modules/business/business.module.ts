import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Business, BusinessSchema } from './business.schema';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Business.name, schema: BusinessSchema }])],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService, MongooseModule],
})
export class BusinessModule {}
