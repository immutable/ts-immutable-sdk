import { Environment } from '@imtbl/config';
import { ChainId, TokenFilterTypes } from '../types';
import { getTokenAllowList } from './tokens';
import { RemoteConfigFetcher } from '../config/remoteConfigFetcher';
import { CheckoutConfiguration } from '../config';

jest.mock('../config/remoteConfigFetcher');

describe('token related functions', () => {
  let config: CheckoutConfiguration;

  describe('when tokens are not configured', () => {
    it('should return the empty list of tokens', async () => {
      (RemoteConfigFetcher as unknown as jest.Mock).mockReturnValue({
        getTokensConfig: jest.fn().mockResolvedValue({ allowed: [] }),
      });
      config = new CheckoutConfiguration({
        baseConfig: { environment: Environment.SANDBOX },
      });
      await expect(
        await getTokenAllowList(config, {
          type: TokenFilterTypes.ALL,
          chainId: ChainId.SEPOLIA,
        }),
      ).toEqual({
        tokens: [],
      });
    });
  });

  describe('getTokenAllowList', () => {
    const remoteConfigMockReturn = {
      getTokensConfig: jest.fn().mockResolvedValue({
        allowed: [
          {
            address: '0x1',
            decimals: 18,
            name: 'token-aa-testnet',
            symbol: 'AA',
          },
          {
            address: '0x2',
            decimals: 18,
            name: 'token-bb-testnet',
            symbol: 'BB',
          },
          {
            address: '',
            decimals: 18,
            name: 'token-cc-testnet',
            symbol: 'CC',
          },
        ],
      }),
      getConfig: jest.fn().mockResolvedValue({
        overrides: {
          rpcURL: 'https://test',
        },
        tokens: [
          {
            address: '0x2',
            decimals: 18,
            name: 'token-bb-testnet',
            symbol: 'BB',
          },
        ],
      }),
    };

    const testcases = [
      {
        text: 'tokens with no filters (ALL type)',
        type: TokenFilterTypes.ALL,
        chainId: ChainId.SEPOLIA,
        exclude: [],
        result: [
          {
            address: '0x1',
            decimals: 18,
            name: 'token-aa-testnet',
            symbol: 'AA',
          },
          {
            address: '0x2',
            decimals: 18,
            name: 'token-bb-testnet',
            symbol: 'BB',
          },
          {
            address: '',
            decimals: 18,
            name: 'token-cc-testnet',
            symbol: 'CC',
          },
        ],
        remoteConfigMockReturn,
      },
      {
        text: 'exclude token with address',
        type: TokenFilterTypes.ALL,
        chainId: ChainId.SEPOLIA,
        exclude: [{ address: '0x2' }],
        result: [
          {
            address: '0x1',
            decimals: 18,
            name: 'token-aa-testnet',
            symbol: 'AA',
          },
          {
            address: '',
            decimals: 18,
            name: 'token-cc-testnet',
            symbol: 'CC',
          },
        ],
        remoteConfigMockReturn,
      },
      {
        text: 'exclude empty address',
        type: TokenFilterTypes.ALL,
        chainId: ChainId.SEPOLIA,
        exclude: [{ address: '' }],
        result: [
          {
            address: '0x1',
            decimals: 18,
            name: 'token-aa-testnet',
            symbol: 'AA',
          },
          {
            address: '0x2',
            decimals: 18,
            name: 'token-bb-testnet',
            symbol: 'BB',
          },
        ],
        remoteConfigMockReturn,
      },
      {
        text: 'tokens with SWAP filter',
        type: TokenFilterTypes.SWAP,
        chainId: ChainId.IMTBL_ZKEVM_DEVNET,
        result: [
          {
            address: '0x2',
            decimals: 18,
            name: 'token-bb-testnet',
            symbol: 'BB',
          },
        ],
        remoteConfigMockReturn,
      },
      {
        text: 'tokens with BRIDGE filter',
        type: TokenFilterTypes.BRIDGE,
        chainId: ChainId.IMTBL_ZKEVM_DEVNET,
        result: [
          {
            address: '0x1',
            decimals: 18,
            name: 'token-aa-testnet',
            symbol: 'AA',
          },
          {
            address: '0x2',
            decimals: 18,
            name: 'token-bb-testnet',
            symbol: 'BB',
          },
          {
            address: '',
            decimals: 18,
            name: 'token-cc-testnet',
            symbol: 'CC',
          },
        ],
        remoteConfigMockReturn,
      },
      {
        text: 'undefined SWAP tokens list',
        type: TokenFilterTypes.SWAP,
        chainId: ChainId.IMTBL_ZKEVM_DEVNET,
        result: [],
        remoteConfigMockReturn: {
          getTokensConfig: jest.fn().mockResolvedValue(undefined),
          getConfig: jest.fn().mockResolvedValue({}),
        },
      },
    ];

    testcases.forEach((testcase) => {
      it(`should return the filtered list of allowed tokens for a given ${testcase.text}`, async () => {
        (RemoteConfigFetcher as unknown as jest.Mock).mockReturnValue(testcase.remoteConfigMockReturn);
        config = new CheckoutConfiguration({
          baseConfig: { environment: Environment.SANDBOX },
        });

        await expect(
          await getTokenAllowList(config, {
            type: testcase.type,
            exclude: testcase.exclude,
            chainId: testcase.chainId,
          }),
        ).toEqual({
          tokens: testcase.result,
        });
      });
    });
  });
});
