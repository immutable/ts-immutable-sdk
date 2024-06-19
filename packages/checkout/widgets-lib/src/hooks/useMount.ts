import { useEffect, useRef } from 'react';

/**
 * useMount hook to runs only once when the component mounts
 * after mounting condition is met
 *
 * @param fn function to run
 * @param shouldMount function to check mount condition
 * @param deps dependencies to watch for changes
 */
export const useMount = (
  fn: () => void,
  shouldMount?: () => boolean,
  deps?: unknown[],
) => {
  const isMounted = useRef(false);

  const shouldMountCheck = () => {
    if (typeof shouldMount === 'function') {
      return shouldMount();
    }

    return true;
  };

  useEffect(() => {
    if (isMounted.current) return;
    if (!shouldMountCheck()) return;

    fn();
    isMounted.current = true;
  }, deps || []);
};
