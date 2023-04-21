/* eslint-disable @typescript-eslint/no-explicit-any */
import { Web3Provider } from '@ethersproject/providers';
import {
  CheckoutError,
  CheckoutErrorType,
  CheckoutInternalError,
  CheckoutInternalErrorType,
  withCheckoutError,
} from '../errors';
import {
  ChainId,
  ChainIdNetworkMap,
  GetNetworkAllowListParams,
  GetNetworkAllowListResult,
  NetworkInfo,
  SwitchNetworkResult,
  WALLET_ACTION,
} from '../types';
import networkMasterList from './network_master_list.json';

const UNRECOGNISED_CHAIN_ERROR_CODE = 4902; // error code (MetaMask)

export async function getNetworkInfo(
  provider: Web3Provider
): Promise<NetworkInfo> {
  return withCheckoutError(
    async () => {
      const network = await provider.getNetwork();

      if (!Object.values(ChainId).includes(network.chainId as ChainId)) {
        // return empty details
        return {
          chainId: network.chainId,
          name: network.name,
          isSupported: false,
        } as NetworkInfo;
      }
      const chainIdNetworkInfo = ChainIdNetworkMap[network.chainId as ChainId];
      return {
        name: chainIdNetworkInfo.chainName,
        chainId: parseInt(chainIdNetworkInfo.chainIdHex, 16),
        nativeCurrency: chainIdNetworkInfo.nativeCurrency,
        isSupported: true,
      };
    },
    {
      type: CheckoutErrorType.GET_NETWORK_INFO_ERROR,
    }
  );
}

export async function switchWalletNetwork(
  provider: Web3Provider,
  chainId: ChainId
): Promise<SwitchNetworkResult> {
  if (!Object.values(ChainId).includes(chainId)) {
    throw new CheckoutError(
      `Chain:${chainId} is not a supported chain`,
      CheckoutErrorType.CHAIN_NOT_SUPPORTED_ERROR
    );
  }

  if (!provider || !provider.provider?.request) {
    throw new CheckoutError(
      'Incompatible provider',
      CheckoutErrorType.PROVIDER_REQUEST_MISSING_ERROR,
      { details: `Unsupported provider` }
    );
  }

  // WT-1146 - Refer to the README in this folder for explantion on the switch network flow
  try {
    await switchNetworkInWallet(provider, chainId);
    // eslint-disable-next-line
  } catch (err: any) {
    if (err.code === UNRECOGNISED_CHAIN_ERROR_CODE) {
      try {
        await addNetworkToWallet(provider, chainId);

        if ((await provider.getNetwork()).chainId !== chainId) {
          // user didn't actually switch
          throw new CheckoutInternalError(
            CheckoutInternalErrorType.REJECTED_SWITCH_AFTER_ADDING_NETWORK
          );
        }
      } catch (err: any) {
        if (
          err?.type ===
          CheckoutInternalErrorType.REJECTED_SWITCH_AFTER_ADDING_NETWORK
        ) {
          throw new CheckoutError(
            'User cancelled switch network request',
            CheckoutErrorType.USER_REJECTED_REQUEST_ERROR
          );
        }

        throw new CheckoutError(
          'User cancelled add network request',
          CheckoutErrorType.USER_REJECTED_REQUEST_ERROR
        );
      }
    } else {
      throw new CheckoutError(
        'User cancelled switch network request',
        CheckoutErrorType.USER_REJECTED_REQUEST_ERROR
      );
    }
  }

  // we can assume that if the above succeeds then user has successfully
  // switched to the network specified
  const newNetwork = ChainIdNetworkMap[chainId as ChainId];
  return {
    network: {
      name: newNetwork.chainName,
      chainId: parseInt(newNetwork.chainIdHex, 16),
      nativeCurrency: newNetwork.nativeCurrency,
    },
  } as SwitchNetworkResult;
}

export async function getNetworkAllowList({
  exclude,
}: GetNetworkAllowListParams): Promise<GetNetworkAllowListResult> {
  const list = networkMasterList.filter(
    (network) =>
      !(exclude || []).map((exc) => exc.chainId).includes(network.chainId)
  );
  const allowedNetworks: NetworkInfo[] = [];
  list.forEach((element) => {
    const newNetwork = ChainIdNetworkMap[element.chainId as ChainId];
    allowedNetworks.push({
      name: newNetwork.chainName,
      chainId: parseInt(newNetwork.chainIdHex, 16),
      nativeCurrency: newNetwork.nativeCurrency,
      isSupported: true,
    });
  });

  return {
    networks: allowedNetworks,
  };
}

// these functions should not be exported. These functions should be used as part of an exported function e.g switchWalletNetwork() above.
// make sure to check if(provider.provider?.request) in the exported function and throw an error
async function switchNetworkInWallet(provider: Web3Provider, chainId: ChainId) {
  if (provider.provider?.request) {
    return await provider.provider.request({
      method: WALLET_ACTION.SWITCH_NETWORK,
      params: [
        {
          chainId: ChainIdNetworkMap[chainId].chainIdHex,
        },
      ],
    });
  }
}

async function addNetworkToWallet(provider: Web3Provider, chainId: ChainId) {
  if (provider.provider?.request) {
    const addNetwork = {
      chainId: ChainIdNetworkMap[chainId].chainIdHex,
      chainName: ChainIdNetworkMap[chainId].chainName,
      rpcUrls: ChainIdNetworkMap[chainId].rpcUrls,
      nativeCurrency: ChainIdNetworkMap[chainId].nativeCurrency,
      blockExplorerUrls: ChainIdNetworkMap[chainId].blockExplorerUrls,
    };
    return await provider.provider.request({
      method: WALLET_ACTION.ADD_NETWORK,
      params: [addNetwork],
    });
  }
}
