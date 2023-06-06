import { ethers } from 'ethers';
import * as network from '../network';
import { ChainId, NetworkFilterTypes } from '../types';
import { CheckoutConfiguration } from '../config';

export async function createReadOnlyProviders(
  config: CheckoutConfiguration,
): Promise<Map<ChainId, ethers.providers.JsonRpcProvider>> {
  const readOnlyProviders = new Map<
  ChainId,
  ethers.providers.JsonRpcProvider
  >();

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
