/* eslint-disable @typescript-eslint/no-explicit-any */
import detectEthereumProvider from "@metamask/detect-provider"
import { ConnectionProviders, ConnectParams } from "./types"
import { WALLET_ACTION } from "../types";
import { Web3Provider, ExternalProvider } from '@ethersproject/providers'
import { CheckoutError, CheckoutErrorType, withCheckoutError } from "../errors/checkoutError";

export async function connectWalletProvider(params: ConnectParams) : Promise<Web3Provider> {
  let web3Provider: Web3Provider | null = null;
  
  switch(params.providerPreference) {
    case ConnectionProviders.METAMASK: {
      web3Provider = await connectMetaMaskProvider();
      break;
    }
    default:
      throw new CheckoutError("Provider preference was not detected", CheckoutErrorType.CONNECT_PROVIDER_ERROR)
  }

  return web3Provider
}

async function connectMetaMaskProvider(): Promise<Web3Provider> {
  const provider = await withCheckoutError<ExternalProvider | null>(async () => {
    return await detectEthereumProvider()
  }, { type: CheckoutErrorType.METAMASK_PROVIDER_ERROR });

  return await withCheckoutError<Web3Provider>(async () => {
    if(!provider?.request) {
      throw new CheckoutError("No MetaMask provider installed.", CheckoutErrorType.METAMASK_PROVIDER_ERROR);
    }
    await provider.request({ method: WALLET_ACTION.CONNECT, params: []});
    return new Web3Provider(provider);
  }, { type: CheckoutErrorType.USER_REJECTED_REQUEST_ERROR });
}
