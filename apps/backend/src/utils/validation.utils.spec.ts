import { BadRequestException } from '@nestjs/common';
import { validateId } from './validation.utils';

describe('validateId', () => {
  it('should not throw an error for a valid ID', () => {
    expect(() => validateId(5, 'User')).not.toThrow();
  });

  it('should throw BadRequestException for ID < 1', () => {
    expect(() => validateId(0, 'User')).toThrow(
      new BadRequestException('Invalid User ID'),
    );
  });

  it('should throw BadRequestException for undefined or null ID', () => {
    expect(() => validateId(undefined as unknown as number, 'Pantry')).toThrow(
      new BadRequestException('Invalid Pantry ID'),
    );
    expect(() => validateId(null as unknown as number, 'Pantry')).toThrow(
      new BadRequestException('Invalid Pantry ID'),
    );
  });
});
