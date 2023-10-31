/* eslint-disable max-len */
import { Web3Provider } from '@ethersproject/providers';
import { WalletProviderName } from '../../../types';

/**
 * Bridge Widget parameters
 * @property {string | undefined} fromContractAddress - The contract address of the token to bridge from, used to populate the bridge form token field
 * @property {string | undefined} amount - The formatted amount to bridge, used to populate the bridge form amount field
 * @property {WalletProviderName | undefined} walletProvider - The wallet provider to use for the bridge widget
 * @property {Web3Provider | undefined} web3Provider - The ethers Web3Provider
 */
export type BridgeWidgetParams = {
  fromContractAddress?: string;
  amount?: string;
  walletProvider?: WalletProviderName
  web3Provider?: Web3Provider
};
