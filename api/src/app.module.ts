import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessModule } from './modules/business/business.module';
import { ServiceModule } from './modules/service/service.module';
import { TokenModule } from './modules/token/token.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/noqueue'),
    BusinessModule,
    ServiceModule,
    TokenModule,
  ],
})
export class AppModule {}
