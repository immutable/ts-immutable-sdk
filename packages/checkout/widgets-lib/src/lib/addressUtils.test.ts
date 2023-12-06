import { abbreviateAddress } from './addressUtils';

describe('addressUtils', () => {
  it('should abbrviate address to first 6 chars, ... then last 4 chars', () => {
    expect(abbreviateAddress('0x1234567890')).toBe('0x1234...7890');
  });

  it('should return empty string when no address provided', () => {
    expect(abbreviateAddress('')).toBe('');
  });

  it('should return empty string when undefined is passed', () => {
    expect(abbreviateAddress(undefined as any)).toBe('');
  });
});
