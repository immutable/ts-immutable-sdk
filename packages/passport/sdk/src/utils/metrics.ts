import { trackError, trackFlow } from '@imtbl/metrics';

export const withMetrics = <T>(
  fn: () => T,
  event: string,
): T => {
  const flow = trackFlow('passport', event);

  try {
    return fn();
  } catch (error) {
    if (error instanceof Error) {
      trackError('passport', event, error);
    }
    flow.addEvent('errored');
    throw error;
  } finally {
    flow.addEvent('End');
  }
};

export const withMetricsAsync = async <T>(
  fn: () => Promise<T>,
  event: string,
): Promise<T> => {
  const flow = trackFlow('passport', event);

  try {
    return await fn();
  } catch (error) {
    if (error instanceof Error) {
      trackError('passport', event, error);
    }
    flow.addEvent('errored');
    throw error;
  } finally {
    flow.addEvent('End');
  }
};
