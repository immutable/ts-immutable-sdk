import { availabilityService } from '../../availability';
import { CheckoutConfiguration } from '../../config';

export const isOnRampAvailable = async (): Promise<boolean> => true;

export const isSwapAvailable = async (
  config: CheckoutConfiguration,
): Promise<boolean> => {
  const availability = availabilityService(config.isDevelopment, config.isProduction);

  try {
    return await availability.checkDexAvailability();
  } catch {
    return false;
  }
};
