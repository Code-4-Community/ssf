import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

export function validateId(id: number, entityName: string): void {
  if (!id || id < 1) {
    throw new BadRequestException(`Invalid ${entityName} ID`);
  }
}

export function validateEnv(name: string): string {
  const v = process.env[name];

  if (!v) {
    throw new InternalServerErrorException(`Missing env var: ${name}`);
  }

  return v;
}
