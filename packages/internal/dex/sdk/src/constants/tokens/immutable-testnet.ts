import { IMMUTABLE_TESTNET_CHAIN_ID } from '../chains';
import { ERC20, Native } from '../../types';

export const NATIVE_IMX_IMMUTABLE_TESTNET: Native = {
  chainId: IMMUTABLE_TESTNET_CHAIN_ID,
  decimals: 18,
  symbol: 'tIMX',
  name: 'Immutable Testnet Token',
  type: 'native',
};

export const WIMX_IMMUTABLE_TESTNET: ERC20 = {
  chainId: IMMUTABLE_TESTNET_CHAIN_ID,
  address: '0x1CcCa691501174B4A623CeDA58cC8f1a76dc3439',
  decimals: 18,
  symbol: 'WIMX',
  name: 'Wrapped Immutable Testnet Token',
  type: 'erc20',
};

export const IMMUTABLE_TESTNET_COMMON_ROUTING_TOKENS: ERC20[] = [
  WIMX_IMMUTABLE_TESTNET,
];
