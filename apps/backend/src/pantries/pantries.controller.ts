import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { Pantry } from './pantry.entity';
import { PantriesService } from './pantries.service';

@Controller('pantries')
export class PantriesController {
  constructor(private pantriesService: PantriesService) {}

  @Get('/nonApproved')
  async getNotApprovedPantries(): Promise<Pantry[]> {
    return this.pantriesService.getNonApprovedPantries();
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
}
