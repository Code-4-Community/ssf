import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PantryReqsService } from './pantryRequests.service';
import { PantryRequest } from './pantryRequest.entity';
import { PantryReqsController } from './pantryRequests.controller';
import { Pantry } from '../pantries/pantry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PantryRequest, Pantry])],
  controllers: [PantryReqsController],
  providers: [PantryReqsService],
})
export class PantryReqsModule {}
