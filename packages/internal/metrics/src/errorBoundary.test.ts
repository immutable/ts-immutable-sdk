import { errorBoundary } from './errorBoundary';

describe('errorBoundary', () => {
  it('returns the result when the function does not throw', () => {
    expect(errorBoundary(() => 3)()).toEqual(3);
  });

  it('returns fallback when the function throws', () => {
    expect(errorBoundary((): number => {
      throw new Error('test');
    }, 3)()).toEqual(3);
  });

  it('swallows async rejections', async () => {
    await expect(errorBoundary(async () => {
      throw new Error('test');
    }, Promise.resolve(3))()).resolves.toEqual(3);
  });
});
