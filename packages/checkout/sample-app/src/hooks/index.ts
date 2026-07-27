import { useEffect, useRef, useState } from 'react';

/**
 * Handle asynchronous operations with memoization.
 * It only re-executes the async function when dependencies change.
 */
export const useAsyncMemo = <T>(
  asyncFn: () => Promise<T>,
  dependencies: any[]
): T | undefined => {
  const [value, setValue] = useState<T | undefined>();

  useEffect(() => {
    let isMounted = true;

    asyncFn().then((result) => {
      if (isMounted) setValue(result);
    });

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return value;
};

/**
 * Like useState bu tracks the current and previous values.
 * Useful if requires comparing previous and current.
 */
export const usePrevState = <T>(
  initialValue: T
): [T, T | undefined, React.Dispatch<React.SetStateAction<T>>] => {
  const [currentValue, setCurrentValue] = useState<T>(initialValue);
  const prevValueRef = useRef<T | undefined>(undefined);

  useEffect(() => {
    prevValueRef.current = currentValue;
  }, [currentValue]);

  return [currentValue, prevValueRef.current, setCurrentValue] as const;
};

export const useMount = <T>(
  effect: () => void,
  dependencies: (T | undefined)[]
) => {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;

    const allDefined = dependencies.every((dep) => dep !== undefined);

    if (allDefined) {
      hasRun.current = true;
      effect();
    }
  }, [dependencies, effect]);
};
