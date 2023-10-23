import { Web3Provider } from '@ethersproject/providers';
import { CheckoutConfiguration } from '../../config';
import { isOnRampGeoBlocked, isSwapGeoBlocked } from './geoBlocking';
import { AvailableRoutingOptions } from '../../types';

const isPassportProvider = (provider: Web3Provider) => (provider.provider as any)?.isPassport === true ?? false;

type GeoBlockingCheck = {
  id: 'onRamp' | 'swap';
  promise: Promise<boolean>;
};

/**
 * Determines which routing options are available.
 */
export const getAvailableRoutingOptions = async (
  config: CheckoutConfiguration,
  provider: Web3Provider,
) : Promise<AvailableRoutingOptions> => {
  const availableRoutingOptions = {
    onRamp: config.isOnRampEnabled,
    swap: config.isSwapEnabled,
    bridge: config.isBridgeEnabled,
  };

  // Geo-blocking checks
  const geoBlockingChecks: GeoBlockingCheck[] = [];
  if (availableRoutingOptions.onRamp) {
    geoBlockingChecks.push({ id: 'onRamp', promise: isOnRampGeoBlocked() });
  }
  if (availableRoutingOptions.swap) {
    geoBlockingChecks.push({ id: 'swap', promise: isSwapGeoBlocked(config) });
  }

  if (geoBlockingChecks.length > 0) {
    const promises = geoBlockingChecks.map((geoBlockingCheck) => geoBlockingCheck.promise);
    const geoBlockingStatus = await Promise.allSettled(promises);

    geoBlockingStatus.forEach((result, index) => {
      const statusId = geoBlockingChecks[index].id;
      availableRoutingOptions[statusId] = availableRoutingOptions[statusId]
        && result.status === 'fulfilled'
        && !result.value;
    });
  }

  // Bridge not available if passport provider
  availableRoutingOptions.bridge = availableRoutingOptions.bridge && !isPassportProvider(provider);

  return availableRoutingOptions;
};
