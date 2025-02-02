import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { PantriesService } from './pantries.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('pantries')
export class PantriesController {
  constructor(private readonly pantriesService: PantriesService) {}

  @Get('/ssf-contact/:pantryId')
  async getSSFContact(@Param('pantryId', ParseIntPipe) pantryId: number) {
    return this.pantriesService.getSSFContactByPantryId(pantryId);
  }

  @Get('/active')
  async getAllActivePantries() {
    return this.pantriesService.getAllActivePantries();
  }
}
