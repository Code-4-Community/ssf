import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { sanitizeUrl, validateEnv, validateId } from './validation.utils';

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

describe('sanitizeUrl', () => {
  it('should return null for malicious protocols', () => {
    const maliciousProtocols = ['javascript:', 'data:', 'file:', 'vbscript:'];

    for (const protocol of maliciousProtocols) {
      expect(sanitizeUrl(protocol + 'test')).toBeNull();
    }
  });

  it('should return null for empty URLs', () => {
    expect(sanitizeUrl('')).toBeNull();
    expect(sanitizeUrl('https://')).toBeNull();
  });

  it('should accept valid http/https URLs', () => {
    const validHttpUrl = 'http://www.tracking.com/test';
    const validHttpsUrl = 'https://www.tracking.com/test';
    expect(sanitizeUrl(validHttpUrl)).toBe(validHttpUrl);
    expect(sanitizeUrl(validHttpsUrl)).toBe(validHttpsUrl);
  });

  it('adds https:// to URL without protocol', () => {
    expect(sanitizeUrl('www.tracking.com/test')).toBe(
      'https://www.tracking.com/test',
    );
  });

  it('trims whitespace from URL', () => {
    expect(sanitizeUrl('  https://www.tracking.com/test   ')).toBe(
      'https://www.tracking.com/test',
    );
  });
});
