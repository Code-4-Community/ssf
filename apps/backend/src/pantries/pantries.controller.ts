import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Pantry } from './pantry.entity';
import { PantriesService } from './pantries.service';
import { or404 } from '../utils';

@Controller('pantries')
export class PantriesController {
  constructor(private pantriesService: PantriesService) {}

  @Get('/:pantryId')
  async getPantry(
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<Pantry> {
    return await or404(() => this.pantriesService.findOne(pantryId));
  }
}
