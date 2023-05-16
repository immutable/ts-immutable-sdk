import { ChainId, TokenFilterTypes } from '../types';
import { getTokenAllowList } from './tokens';

const enum Icon {
  ETH = 'eth-icon',
  TEST = 'test-icon',
  IMX = 'imx-icon',
}

jest.mock(
  './token_master_list.json',
  () => [
    {
      chainId: 1,
      name: 'Eth',
      symbol: 'ETH',
      decimals: 18,
      icon: 'eth-icon',
      tokenFeatures: ['swap', 'bridge'],
    },
    {
      chainId: 11155111,
      name: 'Sep Eth',
      symbol: 'ETH',
      decimals: 18,
      icon: 'eth-icon',
      tokenFeatures: ['swap', 'bridge'],
    },
    {
      chainId: 11155111,
      name: 'Immutable Test token',
      address: '0xD5baF0d03013a1cF11f8D7ef46c34fd5d5dc8C5D',
      symbol: 'TEST',
      decimals: 18,
      icon: 'test-icon',
      tokenFeatures: ['swap', 'bridge'],
    },
    {
      chainId: 11155111,
      name: 'Swap Coin',
      address: '0x123456789',
      symbol: 'SWC',
      decimals: 18,
      tokenFeatures: ['swap', 'fakeFeature'],
    },
    {
      chainId: 11155111,
      name: 'Bridge Coin',
      address: '0x123456789',
      symbol: 'BDC',
      decimals: 18,
      tokenFeatures: ['bridge', 'fakeFeature'],
    },
  ],
  { virtual: true },
);

const sepEthTokenInfo = {
  name: 'Sep Eth',
  symbol: 'ETH',
  decimals: 18,
  icon: Icon.ETH,
};

describe('token related functions', () => {
  describe('getTokenAllowList', () => {
    const testcases = [
      {
        text: 'Eth chain with no filters (ALL type)',
        type: TokenFilterTypes.ALL,
        chainId: ChainId.ETHEREUM,
        exclude: [],
        result: [
          {
            name: 'Eth',
            symbol: 'ETH',
            decimals: 18,
            icon: Icon.ETH,
          },
        ],
      },
      {
        text: 'Sepolia chain with Bridge feature',
        type: TokenFilterTypes.BRIDGE,
        chainId: ChainId.SEPOLIA,
        exclude: [],
        result: [
          sepEthTokenInfo,
          {
            name: 'Immutable Test token',
            symbol: 'TEST',
            address: '0xD5baF0d03013a1cF11f8D7ef46c34fd5d5dc8C5D',
            decimals: 18,
            icon: Icon.TEST,
          },
          {
            name: 'Bridge Coin',
            symbol: 'BDC',
            address: '0x123456789',
            decimals: 18,
          },
        ],
      },
      {
        text: 'Sepolia chain with swap feature (no exclude list)',
        type: TokenFilterTypes.SWAP,
        chainId: ChainId.SEPOLIA,
        exclude: [],
        result: [
          sepEthTokenInfo,
          {
            name: 'Immutable Test token',
            symbol: 'TEST',
            address: '0xD5baF0d03013a1cF11f8D7ef46c34fd5d5dc8C5D',
            decimals: 18,
            icon: Icon.TEST,
          },
          {
            name: 'Swap Coin',
            symbol: 'SWC',
            address: '0x123456789',
            decimals: 18,
          },
        ],
      },
      {
        text: 'exclude list on Sepolia chain with swap feature',
        type: TokenFilterTypes.SWAP,
        chainId: ChainId.SEPOLIA,
        exclude: [
          { address: '' },
          { address: '0xD5baF0d03013a1cF11f8D7ef46c34fd5d5dc8C5D' },
        ],
        result: [
          {
            name: 'Swap Coin',
            symbol: 'SWC',
            address: '0x123456789',
            decimals: 18,
          },
        ],
      },
      {
        text: 'Unsupported chain',
        type: TokenFilterTypes.SWAP,
        chainId: 23,
        exclude: [],
        result: [],
      },
    ];

    testcases.forEach((testcase) => {
      it(`should return the filtered list of allowed tokens for a given ${testcase.text}`, async () => {
        await expect(
          await getTokenAllowList({
            type: testcase.type,
            chainId: testcase.chainId,
            exclude: testcase.exclude,
          }),
        ).toEqual({
          tokens: testcase.result,
        });
      });
    });
  });
});
