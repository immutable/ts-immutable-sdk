import { useBrowserLayoutEffect } from '@biom3/react';
import { useEffect, useRef } from 'react';
// Inspired by https://usehooks-ts.com/react-hook/use-interval
export function useInterval(callback: () => void, delay: number | null): () => void {
  const savedCallback = useRef(callback);
  const interval = useRef<NodeJS.Timer | null>(null);

  // Remember the latest callback if it changes.
  useBrowserLayoutEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    // Note: 0 is a valid value for delay.
    if (!delay && delay !== 0) {
      return;
    }

    interval.current = setInterval(() => savedCallback.current(), delay);

    // eslint-disable-next-line consistent-return
    return () => { clearInterval(interval.current as NodeJS.Timer); };
  }, [delay]);

  return () => {
    if (interval.current) {
      clearInterval(interval.current);
    }
  };
}
