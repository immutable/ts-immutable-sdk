import { isAPIError } from './errors';

describe('isAPIError', () => {
  it('returns true when code and message fields exist', () => {
    expect(isAPIError({ code: 'BAD_REQUEST', message: 'Invalid' })).toBe(true);
  });

  it.each([
    'Not found',
    404,
    null,
    undefined,
  ])('returns false for non-object value: %p', (value) => {
    expect(isAPIError(value)).toBe(false);
  });

  it('returns false when required fields are missing', () => {
    expect(isAPIError({ code: 'BAD_REQUEST' })).toBe(false);
    expect(isAPIError({ message: 'Invalid' })).toBe(false);
  });
});
