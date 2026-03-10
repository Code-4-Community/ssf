import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { sanitizeUrl, validateEnv, validateId } from './validation.utils';
import { promises as dns } from 'dns';

jest.mock('dns', () => ({ promises: { lookup: jest.fn() } }));
const mockLookup = dns.lookup as jest.Mock;

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

describe('await sanitizeUrl', () => {
  it('should return null for malicious protocols', async () => {
    const maliciousProtocols = ['javascript:', 'data:', 'file:', 'vbscript:'];

    for (const protocol of maliciousProtocols) {
      expect(await sanitizeUrl(protocol + 'test')).toBeNull();
    }
  });

  it('should return null for empty or invalid URLs', async () => {
    expect(await sanitizeUrl('')).toBeNull();
    expect(await sanitizeUrl('https://')).toBeNull();
    expect(await sanitizeUrl('https://foo')).toBeNull();
  });

  it('should accept valid http/https URLs', async () => {
    mockLookup.mockResolvedValue({ address: '127.0.0.1', family: 4 });

    const validHttpUrl = 'http://www.tracking.com/test';
    const validHttpsUrl = 'https://www.tracking.com/test';
    expect(await sanitizeUrl(validHttpUrl)).toBe(validHttpUrl);
    expect(await sanitizeUrl(validHttpsUrl)).toBe(validHttpsUrl);
  });

  it('adds https:// to URL without protocol', async () => {
    mockLookup.mockResolvedValue({ address: '127.0.0.1', family: 4 });

    expect(await sanitizeUrl('www.tracking.com/test')).toBe(
      'https://www.tracking.com/test',
    );
  });

  it('trims whitespace from URL', async () => {
    mockLookup.mockResolvedValue({ address: '127.0.0.1', family: 4 });

    expect(await sanitizeUrl('  https://www.tracking.com/test   ')).toBe(
      'https://www.tracking.com/test',
    );
  });

  it('returns null for unreachable hostname', async () => {
    mockLookup.mockRejectedValueOnce(new Error('DNS lookup failed'));

    const result = await sanitizeUrl('https://www.fakefakefake.com');

    expect(result).toBeNull();
    expect(mockLookup).toHaveBeenCalledWith('www.fakefakefake.com');
  });
});
