import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { PantriesService } from './pantries.service';
import { PantriesController } from './pantries.controller';
import { Pantry } from './pantries.entity';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pantry, User]), UsersModule, AuthModule],
  controllers: [PantriesController],
  providers: [PantriesService],
})
export class PantriesModule {}
