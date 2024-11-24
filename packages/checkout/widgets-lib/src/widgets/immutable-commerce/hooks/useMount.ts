import { useEffect, useRef } from 'react';

/**
 * This hook is used to run an effect only once when after the component is mounted.
 * and all dependencies are either by default not undefined or the compare function returns true.
 */
export const useMount = <T, D extends readonly T[]>(
  effect: () => void,
  deps: D,
  compare?: (deps: D) => boolean,
) => {
  const hasRunRef = useRef(false);

  useEffect(() => {
    const allDepsSatisfy = compare
      ? compare(deps)
      : deps.every((dep) => dep !== undefined);
    if (!hasRunRef.current && allDepsSatisfy) {
      hasRunRef.current = true;
      effect();
    }
  }, [deps, effect, compare]);
};
