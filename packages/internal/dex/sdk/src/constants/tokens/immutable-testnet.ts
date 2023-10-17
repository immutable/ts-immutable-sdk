import { IMMUTABLE_TESTNET_CHAIN_ID } from 'constants/chains';
import { ERC20, Native } from 'types';

// TODO: When we move to new chain then TIMX ...1010 will no longer be usable. We should just use the wrapped IMX token
const EDGE_WRAPPED_TIMX_IMMUTABLE_TESTNET: ERC20 = {
  type: 'erc20',
  chainId: IMMUTABLE_TESTNET_CHAIN_ID,
  address: '0x0000000000000000000000000000000000001010',
  decimals: 18,
  symbol: 'tIMX',
  name: 'Immutable Testnet Token',
};

export const NATIVE_TIMX_IMMUTABLE_TESTNET: Native = {
  type: 'native',
  chainId: IMMUTABLE_TESTNET_CHAIN_ID,
  decimals: 18,
  symbol: 'tIMX',
  name: 'Immutable Testnet Token',
};

export const WIMX_IMMUTABLE_TESTNET: ERC20 = {
  type: 'erc20',
  chainId: IMMUTABLE_TESTNET_CHAIN_ID,
  address: '0xAf7cf5D4Af0BFAa85d384d42b8D410762Ccbce69',
  decimals: 18,
  symbol: 'WIMX',
  name: 'Wrapped Immutable X Token',
};

export const IMMUTABLE_TESTNET_COMMON_ROUTING_TOKENS: ERC20[] = [
  EDGE_WRAPPED_TIMX_IMMUTABLE_TESTNET, // TODO: Remove this when we move to new chain
  WIMX_IMMUTABLE_TESTNET,
];
