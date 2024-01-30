import { errorBoundary } from './errorBoundary';

describe('errorBoundary', () => {
  it('should return the result of the function if it does not throw', () => {
    const testFn = () => 3;
    expect(errorBoundary(testFn)()).toEqual(3);
  });
  it('should pass through arguments to the wrapped function accurately', () => {
    const testFn = jest.fn();
    errorBoundary(testFn)(1, 2, 3);
    expect(testFn).toHaveBeenCalledWith(1, 2, 3);
  });
  it('should return the result of a promise function if it does not throw', () => {
    const testFn = async () => 3;
    expect(errorBoundary(testFn)()).resolves.toEqual(3);
  });
  it('should not throw an error for a function that throws', () => {
    const testFn = () => {
      throw new Error('test');
    };
    expect(errorBoundary(testFn)).not.toThrowError();
  });
  it('should not throw an error for an async funtion that errors', () => {
    const testFn = async () => {
      throw new Error('test');
    };
    expect(errorBoundary(testFn)).not.toThrowError();
  });
});
