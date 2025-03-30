import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Pantry } from './pantries.entity';
import { PantriesService } from './pantries.service';
import { User } from '../users/user.entity';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../users/types';
import { Roles } from '../auth/roles.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('pantries')
// @UseInterceptors(CurrentUserInterceptor)
// @UseGuards(AuthGuard('jwt'))
export class PantriesController {
  constructor(private pantriesService: PantriesService) {}

  @Roles(Role.PANTRY, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/pending')
  async getPendingPantries(): Promise<Pantry[]> {
    return this.pantriesService.getPendingPantries();
  }

  @Get('/:pantryId/ssf-contact')
  async getSSFRep(
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<User> {
    return this.pantriesService.findSSFRep(pantryId);
  }

  @Get('/:pantryId')
  async getPantry(
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<Pantry> {
    return this.pantriesService.findOne(pantryId);
  }

  @Roles(Role.PANTRY, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('/approve/:pantryId')
  async approvePantry(
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<void> {
    return this.pantriesService.approve(pantryId);
  }

  @Roles(Role.PANTRY, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('/deny/:pantryId')
  async denyPantry(
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<void> {
    return this.pantriesService.deny(pantryId);
  }
}
