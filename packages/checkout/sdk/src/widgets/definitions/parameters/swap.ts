import { Web3Provider } from '@ethersproject/providers';
import { Passport } from '@imtbl/passport';
import { WalletProviderName } from '../../../types';

/**
 * Swap Widget parameters
 * @property {string | undefined} amount - The formatted amount to swap, used to populate the swap from amount field
 * @property {string | undefined} fromContractAddress - The contract address of the token to swap from
 * @property {string | undefined} toContractAddress - The contract address of the token to swap to
 * @property {WalletProviderName | undefined} walletProvider - The wallet provider to use for the onramp widget
 * @property {Web3Provider | undefined} web3Provider - The ethers Web3Provider
 * @property {Passport | undefined} passport - The passport instance
 */
export interface SwapWidgetParams {
  amount?: string;
  fromContractAddress?: string;
  toContractAddress?: string;
  walletProvider?: WalletProviderName;
  web3Provider?: Web3Provider
  passport?: Passport
}
