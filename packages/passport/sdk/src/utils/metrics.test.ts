import { trackError, trackFlow } from '@imtbl/metrics';
import { withMetrics, withMetricsAsync } from './metrics';

jest.mock('@imtbl/metrics');

describe('passport metrics', () => {
  beforeEach(() => {
    (trackFlow as unknown as jest.Mock).mockImplementation(() => ({
      addEvent: jest.fn(),
    }));
  });

  describe('withMetrics', () => {
    it('should execute the function successfully', () => {
      const returnValue = 'success';
      const anyFn = jest.fn();
      anyFn.mockReturnValue(returnValue);

      expect(withMetrics(anyFn, 'event')).toEqual(returnValue);
    });

    it('should track and re-throw error', () => {
      const errorFunction = jest.fn();
      errorFunction.mockReturnValue(new Error('error'));

      try {
        withMetrics(errorFunction, 'event');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toMatchObject({
          message: 'error',
        });
        expect(trackError).toHaveBeenCalledWith(
          'passport',
          'event',
          error,
        );
      }
    });
  });

  describe('withMetricsAsync', () => {
    it('should execute the async function successfully', async () => {
      const returnValue = 'success';
      const anyFn = jest.fn();
      anyFn.mockResolvedValue(returnValue);

      expect(await withMetricsAsync(anyFn, 'event')).toEqual(returnValue);
    });

    it('should track and re-throw error', async () => {
      const errorFunction = jest.fn();
      errorFunction.mockRejectedValue(new Error('error'));

      try {
        await withMetricsAsync(errorFunction, 'event');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toMatchObject({
          message: 'error',
        });
        expect(trackError).toHaveBeenCalledWith(
          'passport',
          'event',
          error,
        );
      }
    });
  });
});
