import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { User } from '../users/user.entity';
import { PantriesService } from './pantries.service';
import { Pantry } from './pantries.entity';

@Controller('pantries')
export class PantriesController {
  constructor(private pantriesService: PantriesService) {}

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
}
