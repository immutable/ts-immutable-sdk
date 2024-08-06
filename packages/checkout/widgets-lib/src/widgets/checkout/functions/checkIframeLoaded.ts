const TIMEOUT_MS = 10000;
const INTERVAL_MS = 1000;

export function checkIframeLoaded(
  getReadyState: () => string,
  onLoad: () => void,
  onError: () => void,
  timeoutMs: number = TIMEOUT_MS,
): (() => void) | undefined {
  let loaded = false;

  const checkLoadStatus = () => {
    const readyState = getReadyState();
    console.log('🐛 ~ readyState:', readyState);
    try {
      if (readyState === 'complete') {
        loaded = true;
        onLoad();
      }
    } catch {
      onError();
    }
  };

  const intervalId = setInterval(checkLoadStatus, INTERVAL_MS);

  const timeoutId = setTimeout(() => {
    if (!loaded) onError();
    clearInterval(intervalId);
  }, timeoutMs);

  return () => {
    clearInterval(intervalId);
    clearTimeout(timeoutId);
  };
}
