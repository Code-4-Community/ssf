import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { Pantry } from './pantry.entity';
import { PantriesService } from './pantries.service';

@Controller('pantries')
export class PantriesController {
  constructor(private pantriesService: PantriesService) {}

  @Get('/pending')
  async getPendingPantries(): Promise<Pantry[]> {
    return this.pantriesService.getPendingPantries();
  }

  // Changed this to Pantry instead of Pantry[] promise
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
