import { CheckoutConfiguration } from '../../config';

export const isOnRampGeoBlocked = async (): Promise<boolean> => false;

export const isSwapGeoBlocked = async (
  config: CheckoutConfiguration,
): Promise<boolean> => {
  config.isDevelopment;
  await config.remote.checkDexAvailability();
};
