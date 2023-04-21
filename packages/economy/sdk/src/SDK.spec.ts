/**
 * @jest-environment jsdom
 */

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

  public override get isClientSide(): boolean {
    return super.isClientSide;
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

    it('emitNativeEvent should dispatch CustomEvent on client side', () => {
      const dispatchEventSpy = jest.spyOn(document, 'dispatchEvent');
      const detail = { foo: 'bar' };

      sdkMock['emitNativeEvent'](detail);

      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(CustomEvent));
      expect(dispatchEventSpy.mock.calls[0][0].type).toBe(
        'imtbl-economy-event'
      );
      expect((dispatchEventSpy.mock.calls[0][0] as CustomEvent).detail).toEqual(
        detail
      );

      dispatchEventSpy.mockRestore();
    });

    it('emitNativeEvent should not dispatch CustomEvent on server side', () => {
      const dispatchEventSpy = jest.spyOn(document, 'dispatchEvent');
      const detail = { foo: 'bar' };

      const isClientSideMock = jest.spyOn(sdkMock, 'isClientSide', 'get');
      isClientSideMock.mockReturnValue(false);

      sdkMock['emitNativeEvent'](detail);

      expect(dispatchEventSpy).toHaveBeenCalledTimes(0);

      isClientSideMock.mockRestore();
      dispatchEventSpy.mockRestore();
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

  describe('utilities', () => {
    it('should log the arguments passed to it', () => {
      const consoleLogFn = jest.spyOn(console, 'log');

      sdkMock.log('test message');
      expect(consoleLogFn).toHaveBeenCalledWith('SDKMock:', 'test message');

      consoleLogFn.mockRestore();
    });

    it('should return false if not running in a browser environment', () => {
      const oldWindow = window;
      // @ts-ignore
      delete global.window;

      expect(sdkMock['isClientSide']).toBe(false);

      global.window = oldWindow;
    });
  });
});
