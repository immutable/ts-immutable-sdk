import { Flow, trackError, trackFlow } from '@imtbl/metrics';

export const withMetricsAsync = async <T>(
  fn: (flow: Flow) => Promise<T>,
  flowName: string,
  trackStartEvent: boolean = true,
  trackEndEvent: boolean = true,
): Promise<T> => {
  const flow: Flow = trackFlow(
    'passport',
    flowName,
    trackStartEvent,
  );

  try {
    return await fn(flow);
  } catch (error) {
    if (error instanceof Error) {
      trackError('passport', flowName, error, { flowId: flow.details.flowId });
    } else {
      flow.addEvent('errored');
    }
    throw error;
  } finally {
    if (trackEndEvent) {
      flow.addEvent('End');
    }
  }
};
