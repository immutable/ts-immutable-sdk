import { IMMUTABLE_TESTNET_CHAIN_ID } from 'constants/chains';
import { ERC20 } from 'types';

export const TIMX_IMMUTABLE_TESTNET: ERC20 = {
  chainId: IMMUTABLE_TESTNET_CHAIN_ID,
  address: '0x0000000000000000000000000000000000001010',
  decimals: 18,
  symbol: 'tIMX',
  name: 'Immutable Testnet Token',
  type: 'erc20',
};

export const IMMUTABLE_TESTNET_COMMON_ROUTING_TOKENS: ERC20[] = [
  TIMX_IMMUTABLE_TESTNET,
];
