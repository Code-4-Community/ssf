import { BadRequestException } from '@nestjs/common';

export function validateId(id: number, entityName: string): void {
  if (!id || id < 1) {
    throw new BadRequestException(`Invalid ${entityName} ID`);
  }
}
