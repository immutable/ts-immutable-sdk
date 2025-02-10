import { Flow, trackError, trackFlow } from '@imtbl/metrics';

export const withMetrics = <T>(
  fn: (flow: Flow) => T,
  flowName: string,
): T => {
  const flow: Flow = trackFlow('commerce', flowName);

  try {
    return fn(flow);
  } catch (error) {
    if (error instanceof Error) {
      trackError('commerce', flowName, error, { flowId: flow.details.flowId });
    } else {
      flow.addEvent('errored');
    }
    throw error;
  } finally {
    flow.addEvent('End');
  }
};

export const withMetricsAsync = async <T>(
  fn: (flow: Flow) => Promise<T>,
  flowName: string,
  anonymousId?: string,
  errorType?: (error:any)=>string,
): Promise<T> => {
  const flow: Flow = trackFlow('commerce', flowName);
  if (anonymousId) {
    flow.addEvent(`anonymousId_${anonymousId}`);
  }
  try {
    return await fn(flow);
  } catch (error:any) {
    if (error instanceof Error) {
      trackError('commerce', flowName, error, { flowId: flow.details.flowId });
    }
    if (errorType && errorType(error)) {
      flow.addEvent(`errored_${errorType(error)}`);
    } else {
      flow.addEvent('errored');
    }
    throw error;
  } finally {
    flow.addEvent('End');
  }
};
