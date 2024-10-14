import { useEffect, useState } from 'react';

/**
 * Handle asynchronous operations with memoization.
 * It only re-executes the async function when dependencies change.
 */
export const useAsyncMemo = <T>(
  asyncFn: () => Promise<T>,
  dependencies: any[],
): T => {
  const [value, setValue] = useState<T>();

  useEffect(() => {
    let isMounted = true;

    asyncFn().then((result) => {
      if (isMounted) setValue(result);
    });

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return value as T;
};
