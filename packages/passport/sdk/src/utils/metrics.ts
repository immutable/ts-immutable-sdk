import { Flow, trackError, trackFlow } from '@imtbl/metrics';

export const withMetrics = <T>(
  fn: (flow: Flow) => T,
  flowName: string,
): T => {
  const flow: Flow = trackFlow('passport', flowName);

  try {
    return fn(flow);
  } catch (error) {
    if (error instanceof Error) {
      trackError('passport', flowName, error);
    }
    flow.addEvent('errored');
    throw error;
  } finally {
    flow.addEvent('End');
  }
};

export const withMetricsAsync = async <T>(
  fn: (flow: Flow) => Promise<T>,
  flowName: string,
): Promise<T> => {
  const flow: Flow = trackFlow('passport', flowName);

  try {
    return await fn(flow);
  } catch (error) {
    if (error instanceof Error) {
      trackError('passport', flowName, error);
    }
    flow.addEvent('errored');
    throw error;
  } finally {
    flow.addEvent('End');
  }
};
