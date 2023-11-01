import LazyLoad from './lazyLoad';

export default class LazyDocumentReady<T> extends LazyLoad<T> {
  constructor(initialiseFunction: () => T) {
    const documentReadyPromise = () => new Promise<void>((resolve) => {
      if (window.document.readyState === 'complete') {
        resolve();
      } else {
        const onReadyStateChange = () => {
          if (window.document.readyState === 'complete') {
            resolve();
            window.document.removeEventListener('readystatechange', onReadyStateChange);
          }
        };
        window.document.addEventListener('readystatechange', onReadyStateChange);
      }
    });
    super(documentReadyPromise, initialiseFunction);
  }
}
