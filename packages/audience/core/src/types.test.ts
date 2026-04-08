import { IdentityType } from './types';

describe('IdentityType', () => {
  it('matches the OAS enum exactly', () => {
    // Guards against drift from platform-services/services/audience/src/openapi/oas.yml
    expect(Object.values(IdentityType).sort()).toEqual([
      'apple',
      'custom',
      'discord',
      'email',
      'epic',
      'google',
      'passport',
      'steam',
    ]);
  });

  it('exposes PascalCase keys mapping to lowercase wire values', () => {
    expect(IdentityType.Passport).toBe('passport');
    expect(IdentityType.Steam).toBe('steam');
    expect(IdentityType.Epic).toBe('epic');
    expect(IdentityType.Google).toBe('google');
    expect(IdentityType.Apple).toBe('apple');
    expect(IdentityType.Discord).toBe('discord');
    expect(IdentityType.Email).toBe('email');
    expect(IdentityType.Custom).toBe('custom');
  });

  it('has exactly 8 entries', () => {
    expect(Object.keys(IdentityType)).toHaveLength(8);
  });
});
