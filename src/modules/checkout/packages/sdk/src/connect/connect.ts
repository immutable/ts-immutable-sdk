/* eslint-disable @typescript-eslint/no-explicit-any */
import detectEthereumProvider from "@metamask/detect-provider"
import { 
  ConnectionProviders, 
  ConnectParams, 
  ChainId, 
  ChainIdNetworkMap, 
  NetworkInfo, 
  WALLET_ACTION,  
  CheckConnectionResult
} from "../types"
import { Web3Provider, ExternalProvider } from '@ethersproject/providers'
import { CheckoutError, CheckoutErrorType, withCheckoutError } from "../errors";

export async function checkIsWalletConnected(providerPreference: ConnectionProviders): Promise<CheckConnectionResult> {
  const provider = await getWalletProviderForPreference(ConnectionProviders.METAMASK);

  if(!provider.provider?.request) {
    throw new CheckoutError("Incorrect provider", CheckoutErrorType.PROVIDER_REQUEST_MISSING_ERROR);
  }
  const accounts = await provider.provider.request({method: WALLET_ACTION.CHECK_CONNECTION, params:[]});
  // accounts[0] will have the active account if connected.
  
  return {
    isConnected: accounts.length === 1,
    walletAddress: accounts[0] ?? ""
  }
}

export async function connectWalletProvider(params: ConnectParams) : Promise<Web3Provider> {
  const web3Provider = await getWalletProviderForPreference(params.providerPreference);

  await withCheckoutError<void>(async () => {
    if(!web3Provider || !web3Provider?.provider?.request) {
      throw new CheckoutError("No MetaMask provider installed.", CheckoutErrorType.METAMASK_PROVIDER_ERROR);
    }
    // this makes the request to the wallet to connect i.e request eth accounts ('eth_requestAccounts')
    await web3Provider.provider.request({ method: WALLET_ACTION.CONNECT, params: []});
  }, { type: CheckoutErrorType.USER_REJECTED_REQUEST_ERROR });

  return web3Provider
}

async function getWalletProviderForPreference(providerPreference: ConnectionProviders): Promise<Web3Provider> {
  let web3Provider: Web3Provider | null = null;
  switch (providerPreference) {
    case ConnectionProviders.METAMASK: {
      web3Provider = await getMetaMaskProvider();
      break;
    }
    default:
      throw new CheckoutError("Provider preference was not detected", CheckoutErrorType.CONNECT_PROVIDER_ERROR);
  }
  return web3Provider;
}

async function getMetaMaskProvider(): Promise<Web3Provider> {
  const provider = await withCheckoutError<ExternalProvider | null>(async () => {
    return await detectEthereumProvider()
  }, { type: CheckoutErrorType.METAMASK_PROVIDER_ERROR });

  if(!provider) throw new CheckoutError("Could not detect MetaMask provider", CheckoutErrorType.METAMASK_PROVIDER_ERROR);

  return new Web3Provider(provider);
}

export async function getNetworkInfo(provider:Web3Provider) : Promise<NetworkInfo> {
  const network = await provider.getNetwork();

  if(!Object.values(ChainId).includes(network.chainId as ChainId)){
    // return empty details
    return {} as NetworkInfo;
  }
  const chainIdNetworkInfo = ChainIdNetworkMap[network.chainId as ChainId];
  const networkInfo = {
    name: chainIdNetworkInfo.chainName,
    chainId: parseInt(chainIdNetworkInfo.chainIdHex, 16),
    nativeCurrency: chainIdNetworkInfo.nativeCurrency
  }
  return networkInfo;
}
