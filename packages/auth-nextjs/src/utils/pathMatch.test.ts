import { matchPathPrefix } from './pathMatch';

describe('matchPathPrefix', () => {
  describe('exact matches', () => {
    it('should match exact path', () => {
      expect(matchPathPrefix('/api', '/api')).toBe(true);
    });

    it('should match exact path with trailing slash', () => {
      expect(matchPathPrefix('/api/', '/api/')).toBe(true);
    });

    it('should match root path', () => {
      expect(matchPathPrefix('/', '/')).toBe(true);
    });
  });

  describe('prefix matches with path boundaries', () => {
    it('should match nested paths under the pattern', () => {
      expect(matchPathPrefix('/api/users', '/api')).toBe(true);
      expect(matchPathPrefix('/api/users/123', '/api')).toBe(true);
      expect(matchPathPrefix('/dashboard/settings/profile', '/dashboard')).toBe(true);
    });

    it('should match when pattern has trailing slash', () => {
      expect(matchPathPrefix('/api/users', '/api/')).toBe(true);
    });

    it('should match deeply nested paths', () => {
      expect(matchPathPrefix('/api/v1/users/123/posts', '/api')).toBe(true);
    });
  });

  describe('non-matches due to path boundary', () => {
    it('should NOT match paths that share prefix but different segment', () => {
      expect(matchPathPrefix('/apiversion', '/api')).toBe(false);
      expect(matchPathPrefix('/api-docs', '/api')).toBe(false);
      expect(matchPathPrefix('/api2', '/api')).toBe(false);
    });

    it('should NOT match paths with similar but different prefix', () => {
      expect(matchPathPrefix('/dashboard-admin', '/dashboard')).toBe(false);
      expect(matchPathPrefix('/dashboardv2', '/dashboard')).toBe(false);
    });

    it('should NOT match completely different paths', () => {
      expect(matchPathPrefix('/users', '/api')).toBe(false);
      expect(matchPathPrefix('/profile', '/dashboard')).toBe(false);
    });

    it('should NOT match when pathname is shorter', () => {
      expect(matchPathPrefix('/ap', '/api')).toBe(false);
      expect(matchPathPrefix('/a', '/api')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle multi-segment patterns', () => {
      expect(matchPathPrefix('/api/v1/users', '/api/v1')).toBe(true);
      expect(matchPathPrefix('/api/v1', '/api/v1')).toBe(true);
      expect(matchPathPrefix('/api/v12', '/api/v1')).toBe(false);
    });

    it('should handle patterns ending with slash correctly', () => {
      // Pattern '/api/' should match '/api/users' but not '/api' (no trailing slash)
      expect(matchPathPrefix('/api/users', '/api/')).toBe(true);
      expect(matchPathPrefix('/api/', '/api/')).toBe(true);
      // '/api' does not start with '/api/' so this should be false
      expect(matchPathPrefix('/api', '/api/')).toBe(false);
    });

    it('should handle root pattern', () => {
      expect(matchPathPrefix('/anything', '/')).toBe(true);
      expect(matchPathPrefix('/api/users', '/')).toBe(true);
    });
  });
});
