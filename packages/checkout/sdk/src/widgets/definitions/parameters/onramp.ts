import { Passport } from '@imtbl/passport';
import { Web3Provider } from '@ethersproject/providers';
import { WalletProviderName } from '../../../types';
/**
 * OnRamp Widget parameters
 * @property {string | undefined} contractAddress - The contract address of the token to onramp
 * @property {string | undefined} amount - The formatted amount to onramp, used to populate the onramp form amount field
 * @property {WalletProviderName | undefined} walletProvider - The wallet provider to use for the onramp widget
 * @property {Web3Provider | undefined} web3Provider - The ethers Web3Provider
 * @property {Passport | undefined} passport - The passport instance
 */
export type OnRampWidgetParams = {
  contractAddress?: string;
  amount?: string;
  walletProvider?: WalletProviderName;
  web3Provider?: Web3Provider;
  passport?: Passport;
};
