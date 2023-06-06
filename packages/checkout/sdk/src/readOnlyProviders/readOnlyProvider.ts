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

  const sepoliaUrlWithKey = 'https://eth-sepolia.g.alchemy.com/v2/3zIddNTJnsDVa7afu0WIrKk2DAY_dx3u';

  allowedNetworks.networks.forEach((networkInfo) => {
    const rpcUrl = config.networkMap.get(networkInfo.chainId)?.rpcUrls[0];
    const provider = new ethers.providers.JsonRpcProvider(
      networkInfo.chainId === ChainId.SEPOLIA ? sepoliaUrlWithKey : rpcUrl,
    );
    readOnlyProviders.set(networkInfo.chainId, provider);
  });

  return readOnlyProviders;
}
