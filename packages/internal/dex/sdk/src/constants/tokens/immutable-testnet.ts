import { IMMUTABLE_TESTNET_CHAIN_ID } from 'constants/chains';
import { TokenInfo } from 'types';

export const TIMX_IMMUTABLE_TESTNET: TokenInfo = {
  chainId: IMMUTABLE_TESTNET_CHAIN_ID,
  address: '0x0000000000000000000000000000000000001010',
  decimals: 18,
  symbol: 'tIMX',
  name: 'Immutable Testnet Token',
};

export const IMMUTABLE_TESTNET_COMMON_ROUTING_TOKENS: TokenInfo[] = [
  TIMX_IMMUTABLE_TESTNET,
];
