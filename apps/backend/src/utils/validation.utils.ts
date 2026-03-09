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

export function sanitizeUrl(url: string): string | null {
  try {
    const trimmed = url.trim();
    if (!trimmed) return null;

    let fullUrl = trimmed;
    if (!/^https?:\/\//i.test(trimmed)) {
      fullUrl = 'https://' + trimmed;
    }

    const urlObj = new URL(fullUrl);

    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:')
      return null;
    if (!urlObj.hostname || !urlObj.hostname.includes('.')) return null;
    return urlObj.href;
  } catch {
    return null;
  }
}
