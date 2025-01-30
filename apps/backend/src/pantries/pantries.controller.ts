import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { Pantry } from './pantry.entity';
import { PantriesService } from './pantries.service';

@Controller('pantries')
export class PantriesController {
  constructor(private pantriesService: PantriesService) {}

  @Get('/:pantryId')
  async getPantry(
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<Pantry[]> {
    return this.pantriesService.find(pantryId);
  }

  @Get('/nonApproved')
  async getNotApprovedPantries(): Promise<Pantry[]> {
    console.log('Fetching non-approved pantries');
    return this.pantriesService.getNonApprovedPantries();
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
