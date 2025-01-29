import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodRequestsController } from './request.controller';
import { FoodRequest } from './request.entity';
import { RequestsService } from './request.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { AuthService } from '../auth/auth.service';
import { AWSS3Module } from '../aws/aws-s3.module';

@Module({
  imports: [AWSS3Module, TypeOrmModule.forFeature([FoodRequest])],
  controllers: [FoodRequestsController],
  providers: [RequestsService, AuthService, JwtStrategy],
})
export class RequestsModule {}
