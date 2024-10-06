import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Pantry } from './pantry.entity';
import { PantriesService } from './pantries.service';

@Controller('pantries')
export class PantriesController {
  constructor(private pantriesService: PantriesService) {}

  @Get('/:pantryId')
  async getPantry(
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<Pantry> {
    return this.pantriesService.findOne(pantryId);
  }
}
