import { availabilityService } from '../../availability';
import { CheckoutConfiguration } from '../../config';

export const isOnRampGeoBlocked = async (): Promise<boolean> => false;

export const isSwapGeoBlocked = async (
  config: CheckoutConfiguration,
): Promise<boolean> => {
  const availability = availabilityService(config.isDevelopment, config.isProduction);

  try {
    return await availability.checkDexAvailability();
  } catch {
    return false;
  }
};
