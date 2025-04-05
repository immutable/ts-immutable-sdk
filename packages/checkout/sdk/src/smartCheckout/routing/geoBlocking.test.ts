import { isSwapAvailable } from './geoBlocking';
import { AvailabilityService } from '../../availability';

jest.mock('../../availability');

describe('geoBlocking', () => {
  let availabilityService: AvailabilityService;

  describe('isSwapAvailable', () => {
    it('should return true if checkDexAvailability returns true', async () => {
      availabilityService = {
        checkDexAvailability: jest.fn().mockResolvedValue(true),
      } as unknown as AvailabilityService;
      const response = await isSwapAvailable(availabilityService);

      expect(response).toEqual(true);
    });

    it('should return false if checkDexAvailability returns false', async () => {
      availabilityService = {
        checkDexAvailability: jest.fn().mockResolvedValue(false),
      } as unknown as AvailabilityService;
      const response = await isSwapAvailable(availabilityService);

      expect(response).toEqual(false);
    });

    it('should return false by default', async () => {
      availabilityService = {
        checkDexAvailability: jest.fn().mockRejectedValue(new Error()),
      } as unknown as AvailabilityService;
      const response = await isSwapAvailable(availabilityService);

      expect(response).toEqual(false);
    });
  });
});
