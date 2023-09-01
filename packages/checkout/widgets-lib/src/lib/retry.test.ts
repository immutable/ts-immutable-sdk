import { retry } from './retry';

describe('retry', () => {
  it('should succeed without retries if function is successful on first attempt', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');

    const result = await retry(mockFn, { retryIntervalMs: 1, retries: 2 });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(result).toBe('success');
  });

  it('should retry until function succeeds', async () => {
    const mockFn = jest.fn()
      .mockRejectedValueOnce(new Error('Failed 1st time'))
      .mockRejectedValueOnce(new Error('Failed 2nd time'))
      .mockResolvedValue('success');

    const result = await retry(mockFn, { retryIntervalMs: 1, retries: 2 });

    expect(mockFn).toHaveBeenCalledTimes(3);
    expect(result).toBe('success');
  });

  it('should retry until function succeeds without retries', async () => {
    const mockFn = jest.fn()
      .mockRejectedValueOnce(new Error('Failed 1st time'))
      .mockRejectedValueOnce(new Error('Failed 2nd time'))
      .mockRejectedValueOnce(new Error('Failed 3rd time'))
      .mockResolvedValue('success');

    const result = await retry(mockFn, { retryIntervalMs: 1 });

    expect(mockFn).toHaveBeenCalledTimes(4);
    expect(result).toBe('success');
  });

  it('should throw error after max retries', async () => {
    const mockFn = jest.fn()
      .mockRejectedValue(new Error('Failed every time'));

    await expect(
      retry(mockFn, { retryIntervalMs: 1, retries: 2 }),
    ).rejects.toThrow('Failed every time');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });
});
