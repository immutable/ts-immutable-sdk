import { isTokenExpired } from './refresh';

describe('isTokenExpired', () => {
  it('should return true for expired tokens', () => {
    const expiredTime = Date.now() - 1000;
    expect(isTokenExpired(expiredTime)).toBe(true);
  });

  it('should return true for tokens expiring within buffer', () => {
    const almostExpired = Date.now() + 30 * 1000; // 30 seconds from now
    expect(isTokenExpired(almostExpired, 60)).toBe(true); // 60 second buffer
  });

  it('should return false for valid tokens outside buffer', () => {
    const validTime = Date.now() + 120 * 1000; // 2 minutes from now
    expect(isTokenExpired(validTime, 60)).toBe(false);
  });

  it('should return true for NaN', () => {
    expect(isTokenExpired(NaN)).toBe(true);
  });

  it('should return true for undefined/invalid values', () => {
    expect(isTokenExpired(undefined as unknown as number)).toBe(true);
    expect(isTokenExpired(null as unknown as number)).toBe(true);
  });
});
