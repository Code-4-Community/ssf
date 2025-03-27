import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Pantry } from './pantries.entity';
import { PantriesService } from './pantries.service';
import { User } from '../users/user.entity';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { AuthGuard } from '@nestjs/passport';

@Controller('pantries')
@UseInterceptors(CurrentUserInterceptor)
export class PantriesController {
  constructor(private pantriesService: PantriesService) {}

  @Get('/pending')
  @UseGuards(AuthGuard('jwt'))
  async getPendingPantries(@Request() request): Promise<Pantry[]> {
    if (request.user.role !== 'FOODMANUFACTURER') {
      throw new ForbiddenException('Access denied');
    }
    return this.pantriesService.getPendingPantries();
  }

  @Get('/:pantryId/ssf-contact')
  @UseGuards(AuthGuard('jwt'))
  async getSSFRep(
    @Request() request,
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<User> {
    if (request.user.role !== 'PANTRY') {
      throw new ForbiddenException('Access denied');
    }
    return this.pantriesService.findSSFRep(pantryId);
  }

  @Get('/:pantryId')
  @UseGuards(AuthGuard('jwt'))
  async getPantry(
    @Request() request,
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<Pantry> {
    if (request.user.role !== 'PANTRY') {
      throw new ForbiddenException('Access denied');
    }
    return this.pantriesService.findOne(pantryId);
  }

  @Post('/approve/:pantryId')
  @UseGuards(AuthGuard('jwt'))
  async approvePantry(
    @Request() request,
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<void> {
    if (request.user.role !== 'PANTRY') {
      throw new ForbiddenException('Access denied');
    }
    return this.pantriesService.approve(pantryId);
  }

  @Post('/deny/:pantryId')
  @UseGuards(AuthGuard('jwt'))
  async denyPantry(
    @Request() request,
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<void> {
    if (request.user.role !== 'PANTRY') {
      throw new ForbiddenException('Access denied');
    }
    return this.pantriesService.deny(pantryId);
  }
}
