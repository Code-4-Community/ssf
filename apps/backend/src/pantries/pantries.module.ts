import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PantriesController } from './pantries.controller';
import { PantriesService } from './pantries.service';
import { Pantry } from './pantry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pantry])],
  controllers: [PantriesController],
  providers: [PantriesService],
})
export class PantriesModule {}
