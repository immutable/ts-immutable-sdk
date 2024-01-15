import { IMMUTABLE_MAINNET_CHAIN_ID } from 'constants/chains';
import { ERC20, Native } from '../../types';

export const NATIVE_IMX_IMMUTABLE_MAINNET: Native = {
  chainId: IMMUTABLE_MAINNET_CHAIN_ID,
  decimals: 18,
  symbol: 'IMX',
  name: 'Immutable Token',
  type: 'native',
};

export const WIMX_IMMUTABLE_MAINNET: ERC20 = {
  chainId: IMMUTABLE_MAINNET_CHAIN_ID,
  address: '0x3a0c2ba54d6cbd3121f01b96dfd20e99d1696c9d',
  decimals: 18,
  symbol: 'WIMX',
  name: 'Wrapped Immutable Token',
  type: 'erc20',
};

export const ETH_IMMUTABLE_MAINNET: ERC20 = {
  chainId: IMMUTABLE_MAINNET_CHAIN_ID,
  address: '0x52a6c53869ce09a731cd772f245b97a4401d3348',
  decimals: 18,
  symbol: 'ETH',
  name: 'Ethereum',
  type: 'erc20',
};

export const IMMUTABLE_MAINNET_COMMON_ROUTING_TOKENS: ERC20[] = [
  WIMX_IMMUTABLE_MAINNET,
  ETH_IMMUTABLE_MAINNET,
];
