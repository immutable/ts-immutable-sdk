import { lazyDocumentReady, lazyLoad } from './lazyLoad';

describe('lazyLoad', () => {
  it('should return call initFunction and returns the value', async () => {
    const initFunction = jest.fn().mockReturnValue('test');
    const promiseToAwait = jest.fn().mockResolvedValue(undefined);
    const result = await lazyLoad(promiseToAwait, initFunction);
    expect(result).toEqual('test');
    expect(initFunction).toHaveBeenCalled();
  });
});

describe('lazyDocumentReady', () => {
  let mockInitialiseFunction: jest.Mock<any, any>;
  let originalDocument: Document | undefined;

  beforeEach(() => {
    mockInitialiseFunction = jest.fn();
    originalDocument = window.document;
    const mockDocument = {
      ...window.document,
      readyState: 'complete',
    };
    (window as any).document = mockDocument;
  });

  afterEach(() => {
    // Restore the original document.readyState value after each test
    (window as any).document = originalDocument;
  });

  it('should call the initialiseFunction when the document is already ready', async () => {
    jest.spyOn(window.document, 'readyState', 'get').mockReturnValue('complete');

    await lazyDocumentReady(mockInitialiseFunction);

    expect(mockInitialiseFunction).toHaveBeenCalledTimes(1);
  });

  it('should call the initialiseFunction when the document becomes ready', async () => {
    jest.spyOn(window.document, 'readyState', 'get').mockReturnValue('loading');
    const mockAddEventListener = jest.spyOn(window.document, 'addEventListener');

    const lazyDocumentPromise = lazyDocumentReady(mockInitialiseFunction);
    expect(mockInitialiseFunction).toHaveBeenCalledTimes(0);

    jest.spyOn(window.document, 'readyState', 'get').mockReturnValue('complete');
    const mockEvent = new Event('readystatechange');
    window.document.dispatchEvent(mockEvent);

    await lazyDocumentPromise;

    expect(mockAddEventListener).toHaveBeenCalledWith('readystatechange', expect.any(Function));
    expect(mockInitialiseFunction).toHaveBeenCalledTimes(1);
  });
});
