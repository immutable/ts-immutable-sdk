import { Environment } from '@imtbl/config';
import { CheckoutConfiguration } from '../../config';
import { isSwapAvailable } from './geoBlocking';
import { availabilityService } from '../../availability';

jest.mock('../../availability');

describe('geoBlocking', () => {
  let config: CheckoutConfiguration;

  beforeEach(() => {
    config = new CheckoutConfiguration({
      baseConfig: { environment: Environment.PRODUCTION },
    });
  });

  describe('isSwapAvailable', () => {
    it('should return true if checkDexAvailability returns true', async () => {
      (availabilityService as jest.Mock).mockReturnValue({
        checkDexAvailability: jest.fn().mockResolvedValue(true),
      });
      const response = await isSwapAvailable(config);

      expect(response).toEqual(true);
    });

    it('should return false if checkDexAvailability returns false', async () => {
      (availabilityService as jest.Mock).mockReturnValue({
        checkDexAvailability: jest.fn().mockResolvedValue(false),
      });
      const response = await isSwapAvailable(config);

      expect(response).toEqual(false);
    });

    it('should return false by default', async () => {
      (availabilityService as jest.Mock).mockReturnValue({
        checkDexAvailability: jest.fn().mockRejectedValue(new Error()),
      });
      const response = await isSwapAvailable(config);

      expect(response).toEqual(false);
    });
  });
});
