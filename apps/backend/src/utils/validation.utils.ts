import { BadRequestException } from '@nestjs/common';

export function validateId(id: number, entityName: string = 'Entity'): void {
  if (!id || id < 1) {
    throw new BadRequestException(`Invalid ${entityName} ID`);
  }
}
