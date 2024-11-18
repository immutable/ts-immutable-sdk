import { CheckoutConfiguration } from '../../config';
import { isOnRampAvailable, isSwapAvailable } from './geoBlocking';
import { AvailableRoutingOptions, NamedBrowserProvider, WalletProviderName } from '../../types';

export function isPassportProvider(providerName?: WalletProviderName) {
  return providerName === WalletProviderName.PASSPORT;
}

type GeoBlockingCheck = {
  id: 'onRamp' | 'swap';
  promise: Promise<boolean>;
};

/**
 * Determines which routing options are available.
 */
export const getAvailableRoutingOptions = async (
  config: CheckoutConfiguration,
  provider: NamedBrowserProvider,
) : Promise<AvailableRoutingOptions> => {
  const availableRoutingOptions = {
    onRamp: config.isOnRampEnabled,
    swap: config.isSwapEnabled,
    bridge: config.isBridgeEnabled,
  };

  // Geo-blocking checks
  const geoBlockingChecks: GeoBlockingCheck[] = [];
  if (availableRoutingOptions.onRamp) {
    geoBlockingChecks.push({ id: 'onRamp', promise: isOnRampAvailable() });
  }
  if (availableRoutingOptions.swap) {
    geoBlockingChecks.push({ id: 'swap', promise: isSwapAvailable(config) });
  }

  if (geoBlockingChecks.length > 0) {
    const promises = geoBlockingChecks.map((geoBlockingCheck) => geoBlockingCheck.promise);
    const geoBlockingStatus = await Promise.allSettled(promises);

    geoBlockingStatus.forEach((result, index) => {
      const statusId = geoBlockingChecks[index].id;
      availableRoutingOptions[statusId] = availableRoutingOptions[statusId]
        && result.status === 'fulfilled'
        && result.value;
    });
  }

  // Bridge not available if passport provider
  availableRoutingOptions.bridge = availableRoutingOptions.bridge && !isPassportProvider(provider.name);

  return availableRoutingOptions;
};
