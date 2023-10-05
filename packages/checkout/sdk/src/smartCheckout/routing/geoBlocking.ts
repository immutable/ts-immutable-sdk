import { CheckoutConfiguration } from '../../config';

export const isOnRampGeoBlocked = async (): Promise<boolean> => false;

export const isSwapGeoBlocked = async (
  config: CheckoutConfiguration,
): Promise<boolean> => await config.remote.checkDexAvailability();
