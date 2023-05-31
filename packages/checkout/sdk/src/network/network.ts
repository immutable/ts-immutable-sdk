/* eslint-disable @typescript-eslint/no-explicit-any */
import { Web3Provider } from '@ethersproject/providers';
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
  CurrentProviderInfo,
  Providers,
} from '../types';
import networkMasterList from './network_master_list.json';
import { CheckoutConfiguration } from '../config';
import { getWeb3Provider } from '../provider/web3provider';

const UNRECOGNISED_CHAIN_ERROR_CODE = 4902; // error code (MetaMask)

// these functions should not be exported. These functions should be used as part of an exported function e.g switchWalletNetwork() above.
// make sure to check if(provider.provider?.request) in the exported function and throw an error
// eslint-disable-next-line consistent-return
async function switchNetworkInWallet(
  networkMap: NetworkMap,
  provider: Web3Provider,
  chainId: ChainId,
) {
  if (provider.provider?.request) {
    return await provider.provider.request({
      method: WalletAction.SWITCH_NETWORK,
      params: [
        {
          chainId: networkMap.get(chainId)?.chainIdHex,
        },
      ],
    });
  }
}

// TODO: Should these functions always return something?
// eslint-disable-next-line consistent-return
async function addNetworkToWallet(
  networkMap: NetworkMap,
  provider: Web3Provider,
  chainId: ChainId,
) {
  if (provider.provider?.request) {
    const networkDetails = networkMap.get(chainId);
    const addNetwork = {
      chainId: networkDetails?.chainIdHex,
      chainName: networkDetails?.chainName,
      rpcUrls: networkDetails?.rpcUrls,
      nativeCurrency: networkDetails?.nativeCurrency,
      blockExplorerUrls: networkDetails?.blockExplorerUrls,
    };
    return await provider.provider.request({
      method: WalletAction.ADD_NETWORK,
      params: [addNetwork],
    });
  }
}

export async function getNetworkAllowList(
  config: CheckoutConfiguration,
  { type = NetworkFilterTypes.ALL, exclude }: GetNetworkAllowListParams,
): Promise<GetNetworkAllowListResult> {
  const { networkMap } = config;

  const list = networkMasterList.filter((network) => {
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
  provider: Web3Provider,
): Promise<NetworkInfo> {
  const { networkMap } = config;
  return withCheckoutError(
    async () => {
      const network = await provider.getNetwork();
      if (!Array.from(networkMap.keys()).includes(network.chainId as ChainId)) {
        // return empty details
        return {
          chainId: network.chainId,
          name: network.name,
          isSupported: false,
        } as NetworkInfo;
      }
      const chainIdNetworkInfo = networkMap.get(network.chainId as ChainId);
      return {
        name: chainIdNetworkInfo!.chainName,
        chainId: parseInt(chainIdNetworkInfo!.chainIdHex, 16),
        nativeCurrency: chainIdNetworkInfo!.nativeCurrency,
        isSupported: true,
      };
    },
    {
      type: CheckoutErrorType.GET_NETWORK_INFO_ERROR,
    },
  );
}

export async function switchWalletNetwork(
  config: CheckoutConfiguration,
  web3Provider: Web3Provider,
  chainId: ChainId,
  currentProviderInfo: CurrentProviderInfo,
  allProviders: Providers,
): Promise<SwitchNetworkResult> {
  const currentProvider = web3Provider;
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

  if (!currentProvider || !currentProvider.provider?.request) {
    throw new CheckoutError(
      'Incompatible provider',
      CheckoutErrorType.PROVIDER_REQUEST_MISSING_ERROR,
      { details: 'Unsupported provider' },
    );
  }

  // WT-1146 - Refer to the README in this folder for explantion on the switch network flow
  try {
    await switchNetworkInWallet(networkMap, currentProvider, chainId);
  } catch (err: any) {
    if (err.code === UNRECOGNISED_CHAIN_ERROR_CODE) {
      try {
        await addNetworkToWallet(networkMap, currentProvider, chainId);
        // eslint-disable-next-line @typescript-eslint/no-shadow
      } catch (err: any) {
        throw new CheckoutError(
          'User cancelled add network request',
          CheckoutErrorType.USER_REJECTED_REQUEST_ERROR,
        );
      }
    } else {
      throw new CheckoutError(
        'User cancelled switch network request',
        CheckoutErrorType.USER_REJECTED_REQUEST_ERROR,
      );
    }
  }

  const getW3Params = {
    provider: {
      name: currentProviderInfo.name!,
      chainId,
    },
  };

  const newProvider = await getWeb3Provider(
    config,
    getW3Params,
    currentProviderInfo,
    allProviders,
  );

  let networkInfo: NetworkInfo;
  try {
    networkInfo = await getNetworkInfo(config, newProvider);
  } catch (err) {
    throw new CheckoutError(
      'User cancelled switch network request',
      CheckoutErrorType.USER_REJECTED_REQUEST_ERROR,
    );
  }

  return {
    network: networkInfo,
    provider: newProvider,
  } as SwitchNetworkResult;
}
