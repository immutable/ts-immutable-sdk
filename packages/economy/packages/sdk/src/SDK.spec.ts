import { Configuration, SDK } from './SDK';

export class SDKMock extends SDK {
  constructor(config: Configuration) {
    super(config);
  }

  connect(): void {
    // ...
  }
}

describe('SDK Class', () => {
  describe('constructor', () => {
    it('should instantiate with provided configuration', () => {
      const sdk = new SDKMock({ env: 'production' });
      expect(sdk.getConfig()).toEqual({ env: 'production' });
    });

    it('should call connect() method during instantiation', () => {
      const connectMock = jest.fn();
      class TestSDKMock extends SDKMock {
        override connect() {
          connectMock();
        }
      }

      new TestSDKMock({ env: 'dev' });
      expect(connectMock).toHaveBeenCalled();
    });
  });

  describe('log method', () => {
    it('should log the arguments passed to it', () => {
      const consoleLogFn = jest.spyOn(console, 'log');
      const sdk = new SDKMock({ env: 'dev' });

      sdk.log('test message');
      expect(consoleLogFn).toHaveBeenCalledWith('SDKMock:', 'test message');

      consoleLogFn.mockRestore();
    });
  });
});
