import { Web3Provider } from '@ethersproject/providers';

export function isPassport(provider: Web3Provider) {
  return (provider?.provider as any)?.isPassport === true;
}

export function isMetaMask(provider: Web3Provider) {
  return provider?.provider?.isMetaMask === true;
}
