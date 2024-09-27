import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Pantry } from './pantry.entity';
import { PantriesService } from './pantries.service';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';

@Controller('pantries')
@UseInterceptors(CurrentUserInterceptor)
export class PantriesController {
  constructor(private pantriesService: PantriesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('/:pantryId')
  async getPantry(
    @Param('pantryId', ParseIntPipe) pantryId: number,
  ): Promise<Pantry> {
    return this.pantriesService.findOne(pantryId);
  }
}
