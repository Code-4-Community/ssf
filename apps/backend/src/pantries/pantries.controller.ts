import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('pantries')
export class PantriesController {
  constructor(private usersService: UsersService) {}

  @Get('/ssf-contact/:pantryId')
  async getSSFContact(@Param('pantryId', ParseIntPipe) pantryId: number) {
    return this.usersService.getSSFContactByPantryId(pantryId);
  }
}
