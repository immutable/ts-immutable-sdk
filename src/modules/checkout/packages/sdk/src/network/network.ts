import { Web3Provider } from "@ethersproject/providers"
import { CheckoutError, CheckoutErrorType } from "../errors";
import { WALLET_ACTION } from "../types"
import { Network, NetworkMap } from "./types"

export async function switchWalletNetwork(provider: Web3Provider, network: Network) {
  if(!Object.values(Network).includes(network)) throw new CheckoutError(`${network} is not a supported network`, CheckoutErrorType.NETWORK_NOT_SUPPORTED_ERROR);
  if(!provider.provider?.request) throw new CheckoutError("provider object is missing request function", CheckoutErrorType.PROVIDER_REQUEST_MISSING_ERROR);
    // WT-1146 - Refer to the README in this folder for explantion on the switch network flow
    try {
      await switchNetworkInWallet(provider, network);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch(err:any) {
      if (err.message.includes("Unrecognized chain ID")) {
        try {
          await addNetworkToWallet(provider, network);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch(err: any){
          throw new CheckoutError("user cancelled the add network request", CheckoutErrorType.USER_REJECTED_REQUEST_ERROR);
        }
      } else{
        throw new CheckoutError("user cancelled the switch network request", CheckoutErrorType.USER_REJECTED_REQUEST_ERROR);
      }
    }
}

// these functions should not be exported. These functions should be used as part of an exported function e.g switchWalletNetwork() above.
// make sure to check if(provider.provider?.request) in the exported function and throw an error
async function switchNetworkInWallet(provider: Web3Provider, network: Network) {
  if(provider.provider?.request){
    return await provider.provider.request(
      { 
        method: WALLET_ACTION.SWITCH_NETWORK, 
        params: [
          { 
            chainId: NetworkMap[network].chainId
          }
        ]
      }
    )
  }
}

async function addNetworkToWallet(provider: Web3Provider, network: Network) {
  if(provider.provider?.request) {
    return await provider.provider.request(
      { 
        method: WALLET_ACTION.ADD_NETWORK, 
        params: [
          NetworkMap[network]
        ]
      }
    )
  }
}