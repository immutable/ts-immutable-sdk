/* eslint @typescript-eslint/no-unused-vars: ["error", { "argsIgnorePattern": "^_" }] */

import { poll } from './poll';

describe('poll()', () => {
  it('should execute the request() argument until the termination predicate returns true', async () => {
    let requestNumber = 0;
    const request = () => ++requestNumber;

    const result = await poll(30, 0, (n) => n > 10, request);

    expect(result).toBe(11);
    expect(result).toBe(requestNumber);
  });

  it('should return undefined if the termination predicate always returns false', async () => {
    const request = () => true;

    const result = await poll(30, 0, (_) => false, request);

    expect(result).toBe(undefined);
  });

  it('should return undefined if the termination predicate takes more than the maximum iterations to return true', async () => {
    let requestNumber = 0;
    const request = () => ++requestNumber;

    const result = await poll(30, 0, (n) => n > 30, request);

    expect(result).toBe(undefined);
  });
});
