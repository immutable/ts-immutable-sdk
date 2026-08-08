import { track } from '@imtbl/metrics';

export const withMetrics = <T>(
  fn: () => T,
  flowName: string,
): T => {
  track('passport', flowName);
  try {
    return fn();
  } catch (error) {
    if (error instanceof Error) {
      track('passport', flowName, { error });
    }
    throw error;
  }
};

export const withMetricsAsync = async <T>(
  fn: () => Promise<T>,
  flowName: string,
): Promise<T> => {
  track('passport', flowName);
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Error) {
      track('passport', flowName, { error });
    }
    throw error;
  }
};
