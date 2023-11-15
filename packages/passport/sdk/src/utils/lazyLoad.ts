export const lazyLoad = <T, Y = void>(
  promiseToAwait: () => Promise<Y>,
  initialiseFunction: (arg: Y) => Promise<T> | T,
): Promise<T> => promiseToAwait().then(initialiseFunction);

export const lazyDocumentReady = <T>(initialiseFunction: () => Promise<T> | T): Promise<T> => {
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

  return lazyLoad(documentReadyPromise, initialiseFunction);
};
