import { availabilityService } from '../../availability';
import { CheckoutConfiguration } from '../../config';

export const isOnRampGeoBlocked = async (): Promise<boolean> => false;

export const isSwapGeoBlocked = async (
  config: CheckoutConfiguration,
): Promise<boolean> => {
  let isSwapAvailable;
  const availability = availabilityService(config.isDevelopment, config.isProduction);

  try {
    isSwapAvailable = await availability.checkDexAvailability();
  } catch {
    isSwapAvailable = false;
  }
  return isSwapAvailable;
};
