import { Web3Provider } from '@ethersproject/providers';

export function isPassportProvider(provider?: Web3Provider | null) {
  return (provider?.provider as any)?.isPassport === true;
}

export function isMetaMaskProvider(provider?: Web3Provider | null) {
  return provider?.provider?.isMetaMask === true;
}
