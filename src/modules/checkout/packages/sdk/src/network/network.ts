import { Web3Provider } from "@ethersproject/providers"
import { UserRejectedRequestError, WALLET_ACTION } from "../types"
import { NetworkNotSupportedError } from "./errors"
import { Network, NetworkMap } from "./types"

export async function switchWalletNetwork(provider: Web3Provider, network: Network) {
  if(!Object.values(Network).includes(network)) throw new NetworkNotSupportedError(`${network} is not a supported network`);
  if(!provider.provider?.request) throw new Error("provider object is missing request function");
    // WT-1146 - Refer to the README in this folder for explantion on the switch network flow
    try {
      const switchResponse = await switchNetworkInWallet(provider, network);
    } catch(err:any) {
      if (err.message.includes("Unrecognized chain ID")) {
        try {
          const addResponse = await addNetworkToWallet(provider, network);
        } catch(err: any){
          throw new UserRejectedRequestError("user cancelled the add network request");
        }
      } else{
        throw new UserRejectedRequestError("user cancelled the switch network request");
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
};