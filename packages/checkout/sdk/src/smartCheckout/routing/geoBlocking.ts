import { Environment } from '@imtbl/config';
import { availabilityService } from '../../availability';
import { CheckoutConfiguration } from '../../config';

export const isOnRampGeoBlocked = async (): Promise<boolean> => false;

export const isSwapGeoBlocked = async (
  config: CheckoutConfiguration,
): Promise<boolean> => {
  if (config.environment === Environment.SANDBOX) return false;
  const availability = availabilityService(config.isDevelopment, config.isProduction);
  try {
    return await availability.checkDexAvailability();
  } catch {
    return false;
  }
};
