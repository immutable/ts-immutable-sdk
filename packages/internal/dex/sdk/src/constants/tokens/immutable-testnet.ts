import { IMMUTABLE_TESTNET_CHAIN_ID } from 'constants/chains';
import { ERC20, Native } from 'types/private';

export const NATIVE_IMX_IMMUTABLE_TESTNET: Native = {
  chainId: IMMUTABLE_TESTNET_CHAIN_ID,
  decimals: 18,
  symbol: 'tIMX',
  name: 'Immutable Testnet Token',
  type: 'native',
};

export const TIMX_IMMUTABLE_TESTNET: ERC20 = {
  chainId: IMMUTABLE_TESTNET_CHAIN_ID,
  address: '0x0000000000000000000000000000000000001010',
  decimals: 18,
  symbol: 'tIMX',
  name: 'Immutable Testnet Token',
  type: 'erc20',
};

export const WIMX_IMMUTABLE_TESTNET: ERC20 = {
  chainId: IMMUTABLE_TESTNET_CHAIN_ID,
  address: '0xAf7cf5D4Af0BFAa85d384d42b8D410762Ccbce69',
  decimals: 18,
  symbol: 'WIMX',
  name: 'Wrapped Immutable Testnet Token',
  type: 'erc20',
};

export const IMMUTABLE_TESTNET_COMMON_ROUTING_TOKENS: ERC20[] = [
  TIMX_IMMUTABLE_TESTNET,
  WIMX_IMMUTABLE_TESTNET,
];
