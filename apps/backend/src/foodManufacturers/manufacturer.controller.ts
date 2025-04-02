import { Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { FoodManufacturer } from './manufacturer.entity';
import { ManufacturerService } from './manufacturer.service';

@Controller('manufacturer')
export class ManufacturerController {
  constructor(private manufacturerService: ManufacturerService) {}

  @Get('/getDetails/:manufacturerId')
  async getManufacturerDetails(
    @Param('manufacturerId', ParseIntPipe) manufacturerId: number,
  ): Promise<FoodManufacturer | null> {
    return this.manufacturerService.getDetails(manufacturerId);
  }

  @Patch('/updateFrequency/:manufacturerId/:frequency')
  async updateManufacturerFrequency(
    @Param('manufacturerId') manufacturerId: number,
    @Param('frequency') frequency: string,
  ): Promise<FoodManufacturer | null> {
    return this.manufacturerService.updateManufacturerFrequency(
      manufacturerId,
      frequency,
    );
  }
}
