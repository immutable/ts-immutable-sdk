import { ethers } from 'ethers';
import * as network from '../network';
import { ChainId, NetworkFilterTypes } from '../types';
import { CheckoutConfiguration } from '../config';

export async function createReadOnlyProviders(
  config: CheckoutConfiguration,
  existingReadOnlyProviders?: Map<ChainId, ethers.providers.JsonRpcProvider>,
): Promise<Map<ChainId, ethers.providers.JsonRpcProvider>> {
  if (config.isProduction && existingReadOnlyProviders?.has(ChainId.ETHEREUM)) return existingReadOnlyProviders;
  if (existingReadOnlyProviders?.has(ChainId.SEPOLIA)) return existingReadOnlyProviders;

  const readOnlyProviders = new Map<ChainId, ethers.providers.JsonRpcProvider>();

  const allowedNetworks = await network.getNetworkAllowList(config, {
    type: NetworkFilterTypes.ALL,
  });

  allowedNetworks.networks.forEach((networkInfo) => {
    const rpcUrl = config.networkMap.get(networkInfo.chainId)?.rpcUrls[0];
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    readOnlyProviders.set(networkInfo.chainId, provider);
  });

  return readOnlyProviders;
}
