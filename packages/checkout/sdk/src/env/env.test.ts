import { useLocalBundle, globalPackageVersion, SDK_VERSION_MARKER } from './env';

describe('env', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('useLocalBundle', () => {
    process.env = {
      ...OLD_ENV,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      CHECKOUT_LOCAL_MODE: 'true',
    };
    expect(useLocalBundle()).toBeTruthy();
    process.env = { ...OLD_ENV };
    expect(useLocalBundle()).toBeFalsy();
  });

  it('globalPackageVersion', () => {
    expect(globalPackageVersion()).toBe(SDK_VERSION_MARKER);
  });
});
