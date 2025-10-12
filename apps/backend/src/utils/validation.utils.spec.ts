import { BadRequestException } from '@nestjs/common';
import { validateId } from './validation.utils';

describe('validateId', () => {
  it('should not throw an error for a valid ID', () => {
    expect(() => validateId(5, 'User')).not.toThrow();
  });

  it('should throw BadRequestException for ID < 1', () => {
    expect(() => validateId(0, 'User')).toThrow(BadRequestException);
    expect(() => validateId(0, 'User')).toThrow('Invalid User ID');
  });

  it('should throw BadRequestException for undefined or null ID', () => {
    expect(() => validateId(undefined as unknown as number, 'Pantry')).toThrow(
      'Invalid Pantry ID',
    );
    expect(() => validateId(null as unknown as number, 'Pantry')).toThrow(
      'Invalid Pantry ID',
    );
  });
});
