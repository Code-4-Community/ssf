import { pipeNullable } from './ownership.decorator';

describe('pipeNullable', () => {
  it('should pass the result of each function to the next (sync)', async () => {
    const f1 = jest.fn(() => 1);
    const f2 = jest.fn((n: number) => n + 1);
    const f3 = jest.fn((n: number) => n * 3);

    const result = await pipeNullable(f1, f2, f3);

    expect(result).toBe(6);
    expect(f1).toHaveBeenCalledTimes(1);
    expect(f2).toHaveBeenCalledWith(1);
    expect(f3).toHaveBeenCalledWith(2);
  });

  it('should work with asynchronous functions', async () => {
    const f1 = jest.fn(async () => 2);
    const f2 = jest.fn(async (n: number) => n * 5);

    const result = await pipeNullable(f1, f2);

    expect(result).toBe(10);
    expect(f1).toHaveBeenCalled();
    expect(f2).toHaveBeenCalledWith(2);
  });

  it('should return null immediately if the init function returns null', async () => {
    const f1 = jest.fn(() => null);
    const f2 = jest.fn();

    const result = await pipeNullable(f1, f2);

    expect(result).toBeNull();
    expect(f1).toHaveBeenCalled();
    expect(f2).not.toHaveBeenCalled();
  });

  it('should return null and stop when any intermediate function returns undefined', async () => {
    const f1 = jest.fn(() => 5);
    const f2 = jest.fn(() => undefined);
    const f3 = jest.fn();

    const result = await pipeNullable(f1, f2, f3);

    expect(result).toBeNull();
    expect(f1).toHaveBeenCalled();
    expect(f2).toHaveBeenCalledWith(5);
    expect(f3).not.toHaveBeenCalled();
  });

  it('should handle mixed sync/async and null in middle', async () => {
    const f1 = jest.fn(() => 3);
    const f2 = jest.fn(async () => null);
    const f3 = jest.fn();

    const result = await pipeNullable(f1, f2, f3);

    expect(result).toBeNull();
    expect(f1).toHaveBeenCalled();
    expect(f2).toHaveBeenCalledWith(3);
    expect(f3).not.toHaveBeenCalled();
  });
});
