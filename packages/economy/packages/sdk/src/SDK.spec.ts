import { Subject } from 'rxjs';

import { Configuration, SDK } from './SDK';
import { IEventType } from './types';

export class SDKMock extends SDK<string> {
  constructor(config: Configuration) {
    super(config);
  }

  connect(): void {
    // ...
  }
}

describe('SDK Class', () => {
  let sdkMock: SDKMock;
  const eventHandlerFn = jest.fn();
  const configInput: Configuration = { env: 'production' };

  beforeEach(() => {
    sdkMock = new SDKMock(configInput);
  });

  afterEach(() => {
    sdkMock.disconnect();
    jest.resetAllMocks();
  });

  describe('bootstrap', () => {
    it('should instantiate with provided configuration', () => {
      expect(sdkMock.getConfig()).toEqual(configInput);
    });

    it('should call connect() method during instantiation', () => {
      const connectFn = jest.fn();
      class TestSDKMock extends SDKMock {
        override connect() {
          connectFn();
        }
      }

      const testSDKMock = new TestSDKMock({ env: 'dev' });
      expect(connectFn).toHaveBeenCalled();

      testSDKMock.disconnect();
    });
  });

  describe('events', () => {
    it('should emit events to subscribers', () => {
      const event: IEventType<string> = { type: 'test', status: 'COMPLETE' };

      sdkMock.subscribe(eventHandlerFn);
      sdkMock['events$$'].next(event);
      expect(eventHandlerFn).toHaveBeenCalledWith(event);
    });

    it('should unsubscribe from events', () => {
      const eventsSubject = new Subject<IEventType<string>>();

      sdkMock['events$$'] = eventsSubject;

      sdkMock.subscribe(eventHandlerFn);

      eventsSubject.next({ type: 'test', status: 'COMPLETE' });
      expect(eventHandlerFn).toHaveBeenCalledTimes(1);

      sdkMock.disconnect();
      eventsSubject.next({ type: 'test', status: 'COMPLETE' });
      expect(eventHandlerFn).not.toHaveBeenCalledTimes(2);
    });
  });
  describe('events handler utility', () => {
    it('should return a function', () => {
      const handler = sdkMock['getEmitEventHandler']('test');
      expect(typeof handler).toBe('function');
    });

    it('should emit an event when the returned handler is invoked', () => {
      const eventsSubject = new Subject<IEventType<string>>();
      sdkMock['events$$'] = eventsSubject;

      sdkMock.subscribe(eventHandlerFn);

      const emitHandler = sdkMock['getEmitEventHandler']('test');
      emitHandler('COMPLETE');

      expect(eventHandlerFn).toHaveBeenCalledTimes(1);
      expect(eventHandlerFn).toHaveBeenCalledWith({
        type: 'test',
        status: 'COMPLETE',
      });
    });
  });

  describe('logs', () => {
    it('should log the arguments passed to it', () => {
      const consoleLogFn = jest.spyOn(console, 'log');

      sdkMock.log('test message');
      expect(consoleLogFn).toHaveBeenCalledWith('SDKMock:', 'test message');

      consoleLogFn.mockRestore();
    });
  });
});
