import { memorise } from 'lru-memorise';
import { getGlobalisedValue as globalise } from 'global-const';

const GLOBALISE_KEY = 'imtbl__metrics';
const MEMORISE_TIMEFRAME = 5000;
const MEMORISE_MAX = 1000;

export const getGlobalisedValue = <T>(key: string, value: T): T => globalise<T>(GLOBALISE_KEY, key, value);

export const getGlobalisedCachedFunction = <T extends (...args: any[]) => any>(
  key: string,
  fn: T,
): T => {
  // Some applications (esp backend, or frontends using the split bundles) can sometimes
  // initialise the same request multiple times. This will prevent multiple of the
  // same event,value from being reported in a 1 second period.
  const memorisedFn = memorise(fn, {
    lruOptions: { ttl: MEMORISE_TIMEFRAME, max: MEMORISE_MAX },
  }) as unknown as T;

  return globalise<T>(GLOBALISE_KEY, key, memorisedFn);
};
