import { Controller } from '@nestjs/common';
import { AllocationsService } from './allocations.service';

@Controller('allocations')
export class AllocationsController {
  constructor(private allocationsService: AllocationsService) {}
}
