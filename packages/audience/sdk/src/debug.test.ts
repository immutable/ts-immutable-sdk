import type { Message } from '@imtbl/audience-core';
import { DebugLogger } from './debug';

describe('DebugLogger', () => {
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
  });

  const stubMessage: Message = {
    type: 'track',
    messageId: 'msg-1',
    eventTimestamp: '2026-01-01T00:00:00Z',
    anonymousId: 'anon-1',
    surface: 'web',
    context: { library: 'test', libraryVersion: '0.0.0' },
    event: 'click',
    properties: {},
  };

  it('should not log when disabled', () => {
    const logger = new DebugLogger(false);
    logger.logEvent('track', stubMessage);
    logger.logFlush(true, 1);
    logger.logConsent('none', 'full');
    logger.logWarning('test');

    expect(logSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should log events when enabled', () => {
    const logger = new DebugLogger(true);
    logger.logEvent('track', stubMessage);

    expect(logSpy).toHaveBeenCalledWith(
      '[Immutable Audience] track',
      stubMessage,
    );
  });

  it('should log flush status', () => {
    const logger = new DebugLogger(true);

    logger.logFlush(true, 5);
    expect(logSpy).toHaveBeenCalledWith(
      '[Immutable Audience] flush ok (5 messages)',
    );

    logger.logFlush(false, 3);
    expect(logSpy).toHaveBeenCalledWith(
      '[Immutable Audience] flush failed (3 messages)',
    );
  });

  it('should log consent transitions', () => {
    const logger = new DebugLogger(true);
    logger.logConsent('none', 'full');

    expect(logSpy).toHaveBeenCalledWith(
      '[Immutable Audience] consent none → full',
    );
  });

  it('should log warnings', () => {
    const logger = new DebugLogger(true);
    logger.logWarning('something went wrong');

    expect(warnSpy).toHaveBeenCalledWith(
      '[Immutable Audience] something went wrong',
    );
  });
});
