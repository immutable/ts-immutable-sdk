import { Web3Provider } from "@ethersproject/providers"
import { CheckoutError, CheckoutErrorType } from "../errors";
import { ChainId, SwitchNetworkResult, WALLET_ACTION } from "../types";
import { ChainIdNetworkMap } from "../types"

export async function switchWalletNetwork(provider: Web3Provider, chainId: ChainId): Promise<SwitchNetworkResult> {
  if(!Object.values(ChainId).includes(chainId)) throw new CheckoutError(`${chainId} is not a supported chain`, CheckoutErrorType.CHAIN_NOT_SUPPORTED_ERROR);
  if(!provider.provider?.request) throw new CheckoutError("provider object is missing request function", CheckoutErrorType.PROVIDER_REQUEST_MISSING_ERROR);
    // WT-1146 - Refer to the README in this folder for explantion on the switch network flow
    try {
      await switchNetworkInWallet(provider, chainId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch(err:any) {
      if (err.message.includes("Unrecognized chain ID")) {
        try {
          await addNetworkToWallet(provider, chainId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch(err: any){
          throw new CheckoutError("user cancelled the add network request", CheckoutErrorType.USER_REJECTED_REQUEST_ERROR);
        }
      } else{
        throw new CheckoutError("user cancelled the switch network request", CheckoutErrorType.USER_REJECTED_REQUEST_ERROR);
      }
    }

    // we can assume that if the above succeeds then user has successfully
    // switched to the network specified
    const newNetwork = ChainIdNetworkMap[chainId as ChainId];
    return {
      network: {
        name: newNetwork.chainName,
        chainID: newNetwork.chainIdHex,
        nativeCurrency: newNetwork.nativeCurrency
      }
    } as SwitchNetworkResult;
}

// these functions should not be exported. These functions should be used as part of an exported function e.g switchWalletNetwork() above.
// make sure to check if(provider.provider?.request) in the exported function and throw an error
async function switchNetworkInWallet(provider: Web3Provider, chainId: ChainId) {
  if(provider.provider?.request){
    return await provider.provider.request(
      {
        method: WALLET_ACTION.SWITCH_NETWORK,
        params: [
          {
            chainId: ChainIdNetworkMap[chainId].chainIdHex
          }
        ]
      }
    )
  }
}

async function addNetworkToWallet(provider: Web3Provider, chainId: ChainId) {
  if(provider.provider?.request) {
    const addNetwork = {
      chainId: ChainIdNetworkMap[chainId].chainIdHex,
      chainName: ChainIdNetworkMap[chainId].chainName,
      rpcUrls: ChainIdNetworkMap[chainId].rpcUrls,
      nativeCurrency: ChainIdNetworkMap[chainId].nativeCurrency,
      blockExplorerUrls: ChainIdNetworkMap[chainId].blockExplorerUrls
    };
    return await provider.provider.request(
      {
        method: WALLET_ACTION.ADD_NETWORK,
        params: [
          addNetwork
        ]
      }
    )
  }
}
