import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodRequestsController } from './request.controller';
import { FoodRequest } from './request.entity';
import { RequestsService } from './request.service';
import { AWSS3Module } from '../aws/aws-s3.module';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AWSS3Module,
    MulterModule.register({ dest: './uploads' }),
    TypeOrmModule.forFeature([FoodRequest]),
    AuthModule,
  ],
  controllers: [FoodRequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
