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
      (RemoteConfigFetcher as jest.Mock).mockReturnValue({
        getTokens: jest.fn().mockResolvedValue([]),
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
    beforeEach(() => {
      (RemoteConfigFetcher as jest.Mock).mockReturnValue({
        getTokens: jest.fn().mockResolvedValue([
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
        ]),
      });
      config = new CheckoutConfiguration({
        baseConfig: { environment: Environment.SANDBOX },
      });
    });

    const testcases = [
      {
        text: 'tokens with no filters (ALL type)',
        type: TokenFilterTypes.ALL,
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
        ],
      },
      {
        text: 'exclude list on chain',
        type: TokenFilterTypes.ALL,
        exclude: [{ address: '0x1' }],
        result: [
          {
            address: '0x2',
            decimals: 18,
            name: 'token-bb-testnet',
            symbol: 'BB',
          },
        ],
      },
    ];

    testcases.forEach((testcase) => {
      it(`should return the filtered list of allowed tokens for a given ${testcase.text}`, async () => {
        await expect(
          await getTokenAllowList(config, {
            type: testcase.type,
            exclude: testcase.exclude,
            chainId: ChainId.SEPOLIA,
          }),
        ).toEqual({
          tokens: testcase.result,
        });
      });
    });
  });
});
