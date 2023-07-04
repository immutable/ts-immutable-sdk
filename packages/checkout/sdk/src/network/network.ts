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
  AllowedNetworkConfig,
} from '../types';
import { CheckoutConfiguration } from '../config';
import { getUnderlyingChainId } from '../provider/getUnderlyingProvider';

const UNRECOGNISED_CHAIN_ERROR_CODE = 4902; // error code (MetaMask)

// these functions should not be exported. These functions should be used as part of an exported function e.g switchWalletNetwork() above.
// make sure to check if(provider.provider?.request) in the exported function and throw an error
// eslint-disable-next-line consistent-return
async function switchNetworkInWallet(
  networkMap: NetworkMap,
  web3Provider: Web3Provider,
  chainId: ChainId,
) {
  if (web3Provider.provider?.request) {
    return await web3Provider.provider.request({
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
  web3Provider: Web3Provider,
  chainId: ChainId,
) {
  if (web3Provider.provider?.request) {
    const networkDetails = networkMap.get(chainId);
    const addNetwork = {
      chainId: networkDetails?.chainIdHex,
      chainName: networkDetails?.chainName,
      rpcUrls: networkDetails?.rpcUrls,
      nativeCurrency: networkDetails?.nativeCurrency,
      blockExplorerUrls: networkDetails?.blockExplorerUrls,
    };
    return await web3Provider.provider.request({
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

  const allowedNetworkConfig = (await config.remote.getConfig(
    'allowedNetworks',
  )) as AllowedNetworkConfig[];

  const list = allowedNetworkConfig.filter((network) => {
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
  web3Provider: Web3Provider,
): Promise<NetworkInfo> {
  const { networkMap } = config;
  return withCheckoutError(
    async () => {
      try {
        const network = await web3Provider.getNetwork();
        if (
          Array.from(networkMap.keys()).includes(network.chainId as ChainId)
        ) {
          const chainIdNetworkInfo = networkMap.get(network.chainId as ChainId);
          return {
            name: chainIdNetworkInfo!.chainName,
            chainId: parseInt(chainIdNetworkInfo!.chainIdHex, 16),
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
        const chainId = await getUnderlyingChainId(web3Provider);
        const isSupported = Array.from(networkMap.keys()).includes(
          chainId as ChainId,
        );
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
  web3Provider: Web3Provider,
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

  // WT-1146 - Refer to the README in this folder for explantion on the switch network flow
  try {
    await switchNetworkInWallet(networkMap, web3Provider, chainId);
  } catch (err: any) {
    if (err.code === UNRECOGNISED_CHAIN_ERROR_CODE) {
      try {
        await addNetworkToWallet(networkMap, web3Provider, chainId);
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

  const newProvider = new Web3Provider(web3Provider.provider);

  const newProviderNetwork = await newProvider.getNetwork();
  if (newProviderNetwork.chainId !== chainId) {
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
