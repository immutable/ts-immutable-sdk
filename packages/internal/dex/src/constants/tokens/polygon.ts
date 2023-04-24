import { Token } from '@uniswap/sdk-core';

export const POLYGON_TESTNET_CHAIN_ID = 1442;
export const IMX_PRIVATE_TESTNET_CHAIN_ID = 1337;

export const IMX_POLYGON_TESTNET = new Token(
  POLYGON_TESTNET_CHAIN_ID,
  '0x72958b06abdF2701AcE6ceb3cE0B8B1CE11E0851',
  18,
  'IMX',
  'Immutable X'
);

export const WETH_POLYGON_TESTNET = new Token(
  POLYGON_TESTNET_CHAIN_ID,
  '0x4F062A3EAeC3730560aB89b5CE5aC0ab2C5517aE',
  18,
  'WETH',
  'Wrapped Ether'
);

export const USDC_POLYGON_TESTNET = new Token(
  POLYGON_TESTNET_CHAIN_ID,
  '0x93733225CCc07Ba02b1449aA3379418Ddc37F6EC',
  18,
  'USDC',
  'USD Coin'
);
