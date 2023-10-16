import { IMMUTABLE_TESTNET_CHAIN_ID } from 'constants/chains';
import { TokenInfo } from 'types';

// TODO: When we move to new chain then TIMX ...1010 will no longer be usable. We should just use the wrapped IMX token
export const TIMX_IMMUTABLE_TESTNET: TokenInfo = {
  chainId: IMMUTABLE_TESTNET_CHAIN_ID,
  address: '0x0000000000000000000000000000000000001010',
  decimals: 18,
  symbol: 'tIMX',
  name: 'Immutable Testnet Token',
};

export const WIMX_IMMUTABLE_TESTNET: TokenInfo = {
  chainId: IMMUTABLE_TESTNET_CHAIN_ID,
  address: '0xAf7cf5D4Af0BFAa85d384d42b8D410762Ccbce69',
  decimals: 18,
  symbol: 'WIMX',
  name: 'Wrapped Immutable X Token',
};

export const IMMUTABLE_TESTNET_COMMON_ROUTING_TOKENS: TokenInfo[] = [
  TIMX_IMMUTABLE_TESTNET,
  WIMX_IMMUTABLE_TESTNET,
];
