import { JsonRpcProvider } from 'ethers';
import * as network from '../network';
import { ChainId, NetworkFilterTypes } from '../types';
import { CheckoutConfiguration } from '../config';

export async function createReadOnlyProviders(
  config: CheckoutConfiguration,
  existingReadOnlyProviders?: Map<ChainId, JsonRpcProvider>,
): Promise<Map<ChainId, JsonRpcProvider>> {
  if (config.isProduction && existingReadOnlyProviders?.has(ChainId.ETHEREUM)) return existingReadOnlyProviders;
  if (existingReadOnlyProviders?.has(ChainId.SEPOLIA)) return existingReadOnlyProviders;

  const readOnlyProviders = new Map<ChainId, JsonRpcProvider>();

  const allowedNetworks = await network.getNetworkAllowList(config, {
    type: NetworkFilterTypes.ALL,
  });

  allowedNetworks.networks.forEach((networkInfo) => {
    const rpcUrl = config.networkMap.get(Number(networkInfo.chainId))?.rpcUrls[0];
    const provider = new JsonRpcProvider(rpcUrl);
    readOnlyProviders.set(Number(networkInfo.chainId), provider);
  });

  return readOnlyProviders;
}
