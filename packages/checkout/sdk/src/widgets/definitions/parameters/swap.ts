import { Web3Provider } from '@ethersproject/providers';
import { Passport } from '@imtbl/passport';
import { WalletProviderName } from '../../../types';

export interface SwapWidgetParams {
  amount?: string;
  fromContractAddress?: string;
  toContractAddress?: string;
  walletProvider?: WalletProviderName;
  web3Provider?: Web3Provider
  passport?: Passport
}
