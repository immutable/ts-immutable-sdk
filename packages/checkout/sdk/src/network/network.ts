/* eslint-disable @typescript-eslint/no-explicit-any */
import { JsonRpcProvider } from 'ethers';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';
import {
  ChainId,
  GetNetworkAllowListParams,
  GetNetworkAllowListResult,
  NetworkFilterTypes,
  NetworkInfo,
  SwitchNetworkResult,
  WalletAction,
  NetworkMap,
  AllowedNetworkConfig,
  NamedBrowserProvider,
} from '../types';
import { CheckoutConfiguration } from '../config';
import { getUnderlyingChainId } from '../provider/getUnderlyingProvider';

const UNRECOGNISED_CHAIN_ERROR_CODE = 4902; // error code (MetaMask)

// these functions should not be exported. These functions should be used as part of an exported function e.g switchWalletNetwork() above.
// make sure to check if(provider.send) in the exported function and throw an error
// eslint-disable-next-line consistent-return
async function switchNetworkInWallet(
  networkMap: NetworkMap,
  browserProvider: NamedBrowserProvider,
  chainId: ChainId,
) {
  return await browserProvider.send(WalletAction.SWITCH_NETWORK, [
    { chainId: networkMap.get(chainId)?.chainIdHex },
  ]);
}

// eslint-disable-next-line consistent-return
export async function addNetworkToWallet(
  networkMap: NetworkMap,
  browserProvider: NamedBrowserProvider,
  chainId: ChainId,
) {
  if (browserProvider.send) {
    const networkDetails = networkMap.get(chainId);
    const addNetwork = {
      chainId: networkDetails?.chainIdHex,
      chainName: networkDetails?.chainName,
      rpcUrls: networkDetails?.rpcUrls,
      nativeCurrency: networkDetails?.nativeCurrency,
      blockExplorerUrls: networkDetails?.blockExplorerUrls,
    };
    return await browserProvider.send(WalletAction.ADD_NETWORK, [addNetwork]);
  }

  return Promise.reject('Provider does not support request method');
}

export async function getNetworkAllowList(
  config: CheckoutConfiguration,
  { type = NetworkFilterTypes.ALL, exclude }: GetNetworkAllowListParams,
): Promise<GetNetworkAllowListResult> {
  const { networkMap } = config;

  const allowedNetworkConfig = (await config.remote.getConfig(
    'allowedNetworks',
  )) as AllowedNetworkConfig[];
  if (!allowedNetworkConfig) {
    // eslint-disable-next-line no-console
    console.warn('No allowed networks configured');
  }

  const list = (allowedNetworkConfig || []).filter((network) => {
    const allowAllTokens = type === NetworkFilterTypes.ALL;
    const networkNotExcluded = !(exclude || [])
      .map((exc) => exc.chainId)
      .includes(network.chainId);
    return allowAllTokens && networkNotExcluded;
  });

  const allowedNetworks: NetworkInfo[] = [];
  list.forEach((element) => {
    const newNetwork = networkMap.get(element.chainId as ChainId);
    if (newNetwork) {
      allowedNetworks.push({
        name: newNetwork.chainName,
        chainId: BigInt(parseInt(newNetwork.chainIdHex, 16)),
        nativeCurrency: newNetwork.nativeCurrency,
        isSupported: true,
      });
    }
  });

  return {
    networks: allowedNetworks,
  };
}

export async function getNetworkInfo(
  config: CheckoutConfiguration,
  provider: JsonRpcProvider | NamedBrowserProvider,
): Promise<NetworkInfo> {
  const { networkMap } = config;
  return withCheckoutError(
    async () => {
      try {
        const network = await provider.getNetwork();
        if (
          Array.from(networkMap.keys()).includes(Number(network.chainId))
        ) {
          const chainIdNetworkInfo = networkMap.get(Number(network.chainId));
          return {
            name: chainIdNetworkInfo!.chainName,
            chainId: BigInt(parseInt(chainIdNetworkInfo!.chainIdHex, 16)),
            nativeCurrency: chainIdNetworkInfo!.nativeCurrency,
            isSupported: true,
          };
        }
        return {
          chainId: network.chainId,
          name: network.name,
          isSupported: false,
        } as NetworkInfo;
      } catch (err) {
        const chainId = await getUnderlyingChainId(provider);
        const isSupported = Array.from(networkMap.keys()).includes(Number(chainId));
        return {
          chainId,
          isSupported,
        } as NetworkInfo;
      }
    },
    {
      type: CheckoutErrorType.GET_NETWORK_INFO_ERROR,
    },
  );
}

export async function switchWalletNetwork(
  config: CheckoutConfiguration,
  provider: JsonRpcProvider | NamedBrowserProvider,
  chainId: ChainId,
): Promise<SwitchNetworkResult> {
  const { networkMap } = config;

  const allowedNetworks = await getNetworkAllowList(config, {
    type: NetworkFilterTypes.ALL,
  });

  if (
    !allowedNetworks.networks.some((network) => Number(network.chainId) === chainId)
  ) {
    throw new CheckoutError(
      `Chain:${chainId} is not a supported chain`,
      CheckoutErrorType.CHAIN_NOT_SUPPORTED_ERROR,
    );
  }

  if (provider && 'name' in provider && provider.ethereumProvider?.isPassport) {
    throw new CheckoutError(
      'Switching networks with Passport provider is not supported',
      CheckoutErrorType.SWITCH_NETWORK_UNSUPPORTED,
    );
  }

  // WT-1146 - Refer to the README in this folder for explanation on the switch network flow
  try {
    if (provider && 'name' in provider) {
      await switchNetworkInWallet(networkMap, provider, chainId);
    } else {
      throw new CheckoutError(
        'Incorrect provider type',
        CheckoutErrorType.PROVIDER_ERROR,
      );
    }
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(err);
    if (err.code === UNRECOGNISED_CHAIN_ERROR_CODE) {
      try {
        if ('name' in provider) {
          await addNetworkToWallet(networkMap, provider, chainId);
        } else {
          throw new CheckoutError(
            'Incorrect provider type',
            CheckoutErrorType.PROVIDER_ERROR,
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-shadow
      } catch (err: any) {
        throw new CheckoutError(
          'User cancelled add network request',
          CheckoutErrorType.USER_REJECTED_REQUEST_ERROR,
          { error: err },
        );
      }
    } else {
      throw new CheckoutError(
        'User cancelled switch network request',
        CheckoutErrorType.USER_REJECTED_REQUEST_ERROR,
      );
    }
  }

  const newProvider = new NamedBrowserProvider(provider.name, provider.ethereumProvider!);

  const newProviderNetwork = await newProvider.getNetwork();

  if (Number(newProviderNetwork.chainId) !== chainId) {
    throw new CheckoutError(
      'User cancelled switch network request',
      CheckoutErrorType.USER_REJECTED_REQUEST_ERROR,
    );
  }

  const networkInfo: NetworkInfo = await getNetworkInfo(config, newProvider);

  return {
    network: networkInfo,
    provider: newProvider,
  } as SwitchNetworkResult;
}
