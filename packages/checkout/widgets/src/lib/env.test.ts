import { isDevMode, globalPackageVersion, SDK_VERSION_MARKER } from './env';

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
      CHECKOUT_DEV_MODE: 'true',
    };
    expect(isDevMode()).toBeTruthy();
    process.env = { ...OLD_ENV };
    expect(isDevMode()).toBeFalsy();
  });

  it('globalPackageVersion', () => {
    expect(globalPackageVersion()).toBe(SDK_VERSION_MARKER);
  });
});
