import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { FoodManufacturer } from './manufacturer.entity';
import { ManufacturerService } from './manufacturer.service';

@Controller('manufacturer')
export class ManufacturerController {
  constructor(private manufacturerService: ManufacturerService) {}

  @Get('/get/:manufacturerId')
  async getManufacturer(
    @Param('manufacturerId', ParseIntPipe) manufacturerId: number,
  ): Promise<FoodManufacturer[]> {
    return this.manufacturerService.get(manufacturerId);
  }
}
