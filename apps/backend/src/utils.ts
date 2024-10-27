import { NotFoundException } from '@nestjs/common';

/**
 * Resolve to the result of bodyFn as long as it is not null or undefined. If
 * it is null or undefined, execute exceptFn to throw an exception.
 */
export const orException = async <BodyType>(
  bodyFn: () => Promise<BodyType>,
  exceptFn: () => never,
): Promise<NonNullable<BodyType>> => (await bodyFn()) ?? exceptFn();

/**
 * Resolve to the result of bodyFn as long as it is not null or undefined. If
 * it is null or undefined, throw a NotFoundException (status code 404).
 */
export const or404 = async <BodyType>(
  bodyFn: () => Promise<BodyType>,
): Promise<NonNullable<BodyType>> =>
  orException(bodyFn, () => {
    throw new NotFoundException();
  });
