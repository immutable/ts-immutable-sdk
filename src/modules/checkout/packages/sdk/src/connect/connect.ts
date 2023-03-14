/* eslint-disable @typescript-eslint/no-explicit-any */
import detectEthereumProvider from "@metamask/detect-provider"
import { ConnectionProviders, ConnectParams } from "./types"
import { UserRejectedRequestError, WALLET_ACTION } from "../types";
import { ConnectProviderError, MetaMaskProviderError } from "./errors";
import { Web3Provider, ExternalProvider } from '@ethersproject/providers'

export async function connectWalletProvider(params: ConnectParams) : Promise<Web3Provider> {
  let web3Provider: Web3Provider | null = null;
  
  switch(params.providerPreference) {
    case ConnectionProviders.METAMASK: {
      web3Provider = await connectMetaMaskProvider();
      break;
    }
    default:
      throw new ConnectProviderError("Provider preference was not detected")
  }

  return web3Provider
}

async function connectMetaMaskProvider(): Promise<Web3Provider> {
  let provider: ExternalProvider | null;

  try {
    provider = await detectEthereumProvider();
  } catch(err: any) {
    throw new MetaMaskProviderError(err.message)
  }
  
  if(!provider?.request) {
    throw new MetaMaskProviderError("No MetaMask provider installed.")
  }

  try {
    await provider.request({ method: WALLET_ACTION.CONNECT, params: []});
  } catch(err: any) {
    throw new UserRejectedRequestError(err.message)
  }

  return new Web3Provider(provider);
}
