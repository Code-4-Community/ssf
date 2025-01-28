import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { User } from '../users/user.entity';
import { PantriesService } from './pantries.service';

@Controller('users')
export class PantriesController {
  constructor(private pantriesService: PantriesService) {}

  @Get('/:pantryId/ssf-contact')
  async getUser(
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<User> {
    return this.pantriesService.findSSFRep(pantryId);
  }
}
