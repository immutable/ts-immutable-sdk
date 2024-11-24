export const lazyLoad = <T, Y = void>(
  promiseToAwait: () => Promise<Y>,
  initialiseFunction: (arg: Y) => Promise<T> | T,
): Promise<T> => promiseToAwait().then(initialiseFunction);

export const lazyDocumentReady = <T>(initialiseFunction: () => Promise<T> | T): Promise<T> => {
  const documentReadyPromise = () => new Promise<void>((resolve) => {
    const onReadyStateChange = () => {
      if (window.document.readyState === 'complete') {
        resolve();
        window.document.removeEventListener('readystatechange', onReadyStateChange);
      }
    };

    // Add a handler before checking `readyState` to ensure that we don't miss the event
    window.document.addEventListener('readystatechange', onReadyStateChange);
    if (window.document.readyState === 'complete') {
      resolve();
      window.document.removeEventListener('readystatechange', onReadyStateChange);
    }
  });

  return lazyLoad(documentReadyPromise, initialiseFunction);
};
