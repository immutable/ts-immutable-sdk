import { CancellablePromise } from './cancellablePromise';

describe('CancellablePromise', () => {
  test('should resolve with the correct value', async () => {
    const value = 'test value';
    const promise = new CancellablePromise((resolve) => resolve(value));

    await expect(promise).resolves.toBe(value);
  });

  test('should reject with an error', async () => {
    const error = new Error('test error');
    const promise = new CancellablePromise((_, reject) => reject(error));

    await expect(promise).rejects.toThrow(error);
  });

  test('should be cancelled', async () => {
    const promise = new CancellablePromise((resolve) => setTimeout(() => resolve('should not resolve'), 100));
    try {
      promise.cancel();
      await promise;
    } catch (error) {
      // ignore
    }

    expect(promise.cancelled).toBe(true);
  });

  test('should not resolve after being cancelled', async () => {
    const promise = new CancellablePromise((resolve) => setTimeout(() => resolve('should not resolve'), 100));
    try {
      promise.cancel();
      await promise;
    } catch (error) {
      // ignore
    }

    await expect(promise).rejects.toEqual({ cancelled: true });
  });

  test('onCancelled callback should be called upon cancellation', async () => {
    const onCancelledMock = jest.fn();
    const promise = new CancellablePromise((resolve) => setTimeout(() => resolve('should not resolve'), 100));
    promise.onCancelled(onCancelledMock);

    try {
      promise.cancel();
      await promise;
    } catch (error) {
      // ignore
    }
    expect(promise.cancelled).toBe(true);
    expect(onCancelledMock).toHaveBeenCalled();
  });

  test('CancellablePromise.all should resolve all promises', async () => {
    const promises = [
      new CancellablePromise((resolve) => resolve('value1')),
      new CancellablePromise((resolve) => resolve('value2')),
    ];

    await expect(CancellablePromise.all(promises)).resolves.toEqual(['value1', 'value2']);
  });

  test('CancellablePromise.all should reject if any promise is rejected', async () => {
    const error = new Error('test error');
    const promises = [
      new CancellablePromise((resolve) => resolve('value1')),
      new CancellablePromise((_, reject) => reject(error)),
    ];

    await expect(CancellablePromise.all(promises)).rejects.toThrow(error);
  });

  test('CancellablePromise.all should handle cancellation correctly', async () => {
    const promises = [
      new CancellablePromise((resolve) => setTimeout(() => resolve('value1'), 100)),
      new CancellablePromise((resolve) => setTimeout(() => resolve('value2'), 100)),
    ];
    const allPromise = CancellablePromise.all(promises);
    try {
      promises[0].cancel();
      await allPromise;
    } catch (error) {
      // ignore
    }

    await expect(allPromise).rejects.toEqual({ cancelled: true });
  });
});
