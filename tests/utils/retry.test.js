const { retry, sleep } = require('../../src/utils/retry');

jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));

// Speed up tests by mocking sleep
jest.mock('../../src/utils/retry', () => {
  const original = jest.requireActual('../../src/utils/retry');
  return {
    ...original,
    sleep: jest.fn().mockResolvedValue(undefined)
  };
});

describe('retry()', () => {
  test('returns result on first success', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const result = await retry(fn, 3, 'test');
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('retries on failure and eventually succeeds', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockResolvedValue('success');

    const result = await retry(fn, 3, 'test', 10);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('throws after all attempts are exhausted', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('always fails'));

    await expect(retry(fn, 3, 'test', 10)).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
