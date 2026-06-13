import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Business, BusinessSchema } from './business.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Business.name, schema: BusinessSchema }])],
  exports: [MongooseModule],
})
export class BusinessModule {}
