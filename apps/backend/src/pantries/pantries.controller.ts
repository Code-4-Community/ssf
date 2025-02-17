import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { Pantry } from './pantries.entity';
import { PantriesService } from './pantries.service';
import { User } from '../users/user.entity';

@Controller('pantries')
export class PantriesController {
  constructor(private pantriesService: PantriesService) {}

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

  @Post('/approve/:pantryId')
  async approvePantry(
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<void> {
    return this.pantriesService.approve(pantryId);
  }

  @Post('/deny/:pantryId')
  async denyPantry(
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<void> {
    return this.pantriesService.deny(pantryId);
  }
}
