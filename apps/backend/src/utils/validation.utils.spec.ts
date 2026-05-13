import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { hasDuplicates, validateEnv, validateId } from './validation.utils';

describe('validateId', () => {
  it('should not throw an error for a valid ID', () => {
    expect(() => validateId(5, 'User')).not.toThrow();
  });

  it('should throw BadRequestException for ID < 1', () => {
    expect(() => validateId(0, 'User')).toThrow(
      new BadRequestException('Invalid User ID'),
    );
  });
});

describe('validateEnv', () => {
  const ENV_NAME = 'TEST_ENV_VAR';

  afterEach(() => {
    delete process.env[ENV_NAME];
  });

  it('should return the env variable value if it exists', () => {
    process.env[ENV_NAME] = 'some-value';

    const result = validateEnv(ENV_NAME);

    expect(result).toBe('some-value');
  });

  it('should throw InternalServerErrorException if env variable is missing', () => {
    delete process.env[ENV_NAME];

    expect(() => validateEnv(ENV_NAME)).toThrow(
      new InternalServerErrorException(`Missing env var: ${ENV_NAME}`),
    );
  });
});

describe('hasDuplicates', () => {
  it('returns true for int array with duplicates', () => {
    expect(hasDuplicates([1, 1, 2])).toBeTruthy();
  });

  it('returns false for int array with no duplicates', () => {
    expect(hasDuplicates([1, 2, 3])).toBeFalsy();
  });

  it('returns true for string array with duplicates', () => {
    expect(hasDuplicates(['a', 'a', 'b'])).toBeTruthy();
  });

  it('returns false for string array with no duplicates', () => {
    expect(hasDuplicates(['a', 'b', 'c'])).toBeFalsy();
  });

  it('returns false for empty array', () => {
    expect(hasDuplicates([])).toBeFalsy();
  });
});
