import { Environment } from '@imtbl/config';
import { CheckoutConfiguration } from '../../config';
import { isSwapGeoBlocked } from './geoBlocking';
import { availabilityService } from '../../availability';

jest.mock('../../availability');

describe('geoBlocking', () => {
  let config: CheckoutConfiguration;

  beforeEach(() => {
    config = new CheckoutConfiguration({
      baseConfig: { environment: Environment.PRODUCTION },
    });
  });

  describe('isSwapGeoBlocked', () => {
    it('should return true if checkDexAvailability returns true', async () => {
      (availabilityService as jest.Mock).mockReturnValue({
        checkDexAvailability: jest.fn().mockResolvedValue(true),
      });
      const response = await isSwapGeoBlocked(config);

      expect(response).toEqual(true);
    });

    it('should return false if checkDexAvailability returns false', async () => {
      (availabilityService as jest.Mock).mockReturnValue({
        checkDexAvailability: jest.fn().mockResolvedValue(false),
      });
      const response = await isSwapGeoBlocked(config);

      expect(response).toEqual(false);
    });

    it('should return false by default', async () => {
      (availabilityService as jest.Mock).mockReturnValue({
        checkDexAvailability: jest.fn().mockRejectedValue(new Error()),
      });
      const response = await isSwapGeoBlocked(config);

      expect(response).toEqual(false);
    });
  });
});
