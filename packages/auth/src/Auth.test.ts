import { withMetricsAsync } from './utils/metrics';

const trackFlowMock = jest.fn();
const trackErrorMock = jest.fn();

jest.mock('@imtbl/metrics', () => ({
  trackFlow: (...args: any[]) => trackFlowMock(...args),
  trackError: (...args: any[]) => trackErrorMock(...args),
}));

describe('withMetricsAsync', () => {
  beforeEach(() => {
    trackFlowMock.mockReset();
    trackErrorMock.mockReset();
  });

  it('resolves with function result and tracks flow', async () => {
    const flow = {
      addEvent: jest.fn(),
      details: { flowId: 'flow-id' },
    };
    trackFlowMock.mockReturnValue(flow);

    const result = await withMetricsAsync(async () => 'done', 'login');

    expect(result).toEqual('done');
    expect(trackFlowMock).toHaveBeenCalledWith('passport', 'login', true);
    expect(flow.addEvent).toHaveBeenCalledWith('End');
  });

  it('tracks error when function throws', async () => {
    const flow = {
      addEvent: jest.fn(),
      details: { flowId: 'flow-id' },
    };
    trackFlowMock.mockReturnValue(flow);
    const error = new Error('boom');

    await expect(withMetricsAsync(async () => {
      throw error;
    }, 'login')).rejects.toThrow(error);

    expect(trackErrorMock).toHaveBeenCalledWith('passport', 'login', error, { flowId: 'flow-id' });
    expect(flow.addEvent).toHaveBeenCalledWith('End');
  });

  it('does not fail when non-error is thrown', async () => {
    const flow = {
      addEvent: jest.fn(),
      details: { flowId: 'flow-id' },
    };
    trackFlowMock.mockReturnValue(flow);

    const nonError = { message: 'failure' };
    await expect(withMetricsAsync(async () => {
      throw nonError as unknown as Error;
    }, 'login')).rejects.toBe(nonError);

    expect(flow.addEvent).toHaveBeenCalledWith('errored');
  });
});
