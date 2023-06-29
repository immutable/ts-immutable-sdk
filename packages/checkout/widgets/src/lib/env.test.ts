import { isDevMode, packageVersion } from './env';

describe('env', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('isDevMode', () => {
    process.env = {
      ...OLD_ENV,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      CHECKOUT_ENVIRONMENT: 'local',
    };
    expect(isDevMode()).toBeTruthy();
    process.env = { ...OLD_ENV };
    expect(isDevMode()).toBeFalsy();
  });

  it('packageVersion', () => {
    process.env = {
      ...OLD_ENV,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      NEXT_VERSION: '0.1.1',
    };
    expect(packageVersion()).toBe('0.1.1');
    process.env = { ...OLD_ENV };
    expect(packageVersion()).toBe('0');
  });
});
