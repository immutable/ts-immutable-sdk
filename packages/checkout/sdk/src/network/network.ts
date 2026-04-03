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
  WrappedBrowserProvider,
} from '../types';
import { CheckoutConfiguration } from '../config';
import { getUnderlyingChainId } from '../provider/getUnderlyingProvider';

const UNRECOGNISED_CHAIN_ERROR_CODE = 4902; // error code (MetaMask)

// these functions should not be exported. These functions should be used as part of an exported function e.g switchWalletNetwork() above.
// make sure to check if(provider.send) in the exported function and throw an error
// eslint-disable-next-line consistent-return
async function switchNetworkInWallet(
  networkMap: NetworkMap,
  browserProvider: WrappedBrowserProvider,
  chainId: ChainId,
) {
  return await browserProvider.send(WalletAction.SWITCH_NETWORK, [
    { chainId: networkMap.get(chainId)?.chainIdHex },
  ]);
}

// eslint-disable-next-line consistent-return
export async function addNetworkToWallet(
  networkMap: NetworkMap,
  browserProvider: WrappedBrowserProvider,
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
        chainId: parseInt(newNetwork.chainIdHex, 16),
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
  provider: JsonRpcProvider | WrappedBrowserProvider,
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
            chainId: parseInt(chainIdNetworkInfo!.chainIdHex, 16),
            nativeCurrency: chainIdNetworkInfo!.nativeCurrency,
            isSupported: true,
          };
        }
        return {
          chainId: Number(network.chainId),
          name: network.name,
          isSupported: false,
        } as NetworkInfo;
      } catch (err) {
        const chainId = await getUnderlyingChainId(provider);
        const isSupported = Array.from(networkMap.keys()).includes(Number(chainId));
        return {
          chainId: Number(chainId),
          isSupported,
        } as NetworkInfo;
      }
    },
    {
      type: CheckoutErrorType.GET_NETWORK_INFO_ERROR,
    },
  );
}

/**
 * Errors in ethers v6 are broken - https://github.com/ethers-io/ethers.js/issues/4576
 * You get "Error: could not coalesce error....".
 * This is a workaround to check if the error is an unrecognised chain error.
 * */
const isUnrecognisedChainError = (err: any) => err.error?.data?.originalError?.code === UNRECOGNISED_CHAIN_ERROR_CODE
  || err.error?.code === UNRECOGNISED_CHAIN_ERROR_CODE;

export async function switchWalletNetwork(
  config: CheckoutConfiguration,
  provider: WrappedBrowserProvider,
  chainId: ChainId,
): Promise<SwitchNetworkResult> {
  const { networkMap } = config;

  const allowedNetworks = await getNetworkAllowList(config, {
    type: NetworkFilterTypes.ALL,
  });

  if (
    !allowedNetworks.networks.some((network) => network.chainId === chainId)
  ) {
    throw new CheckoutError(
      `Chain:${chainId} is not a supported chain`,
      CheckoutErrorType.CHAIN_NOT_SUPPORTED_ERROR,
    );
  }

  if (provider.ethereumProvider?.isPassport) {
    throw new CheckoutError(
      'Switching networks with Passport provider is not supported',
      CheckoutErrorType.SWITCH_NETWORK_UNSUPPORTED,
    );
  }

  // walletconnect on trying to switch network, if network doesn't exist, it does not throw an error!
  // so the catch block below is not triggered, so we need to add the network manually
  // always calling addNetworkToWallet is harmless, as nothing happens if the network already exists
  if (provider.ethereumProvider?.isWalletConnect) {
    await addNetworkToWallet(networkMap, provider, chainId);
  }

  // WT-1146 - Refer to the README in this folder for explanation on the switch network flow
  try {
    await switchNetworkInWallet(networkMap, provider, chainId);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    if (isUnrecognisedChainError(err)) {
      try {
        await addNetworkToWallet(networkMap, provider, chainId);
        // eslint-disable-next-line @typescript-eslint/no-shadow
      } catch (err) {
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

  const newProvider = new WrappedBrowserProvider(provider.ethereumProvider!);

  const newProviderNetwork = await newProvider.getNetwork();

  if (Number(newProviderNetwork.chainId) !== chainId) {
    throw new CheckoutError(
      'User cancelled switch network request',
      CheckoutErrorType.USER_REJECTED_REQUEST_ERROR,
    );
  }

  const networkInfo = await getNetworkInfo(config, newProvider);

  return {
    network: networkInfo,
    provider: newProvider,
  };
}
