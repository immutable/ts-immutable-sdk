import { IMMUTABLE_TESTNET_CHAIN_ID } from 'constants/chains';
import { Token } from 'types/amount';

export const TIMX_IMMUTABLE_TESTNET: Token = new Token(
  IMMUTABLE_TESTNET_CHAIN_ID,
  '0x0000000000000000000000000000000000001010',
  18,
  'tIMX',
  'Immutable Testnet Token',
);

export const IMMUTABLE_TESTNET_COMMON_ROUTING_TOKENS: Token[] = [
  TIMX_IMMUTABLE_TESTNET,
];
