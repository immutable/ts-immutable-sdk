/* eslint-disable @typescript-eslint/naming-convention */
import { TokenInfo } from '@imtbl/dex-sdk';
import { BigNumber } from 'ethers';
import { Environment } from '@imtbl/config';
import { getOrSetQuotesFromCache } from './dexQuoteCache';
import { DexQuote, DexQuoteCache, DexQuotes } from '../types';
import { CheckoutConfiguration } from '../../../config';
import { quoteFetcher } from './quoteFetcher';

jest.mock('./quoteFetcher');

describe('dexQuoteCache', () => {
  it('should fetch from the cache', async () => {
    (quoteFetcher as jest.Mock).mockReturnValue({});

    const config = new CheckoutConfiguration({
      baseConfig: { environment: Environment.SANDBOX },
    });

    const cache: DexQuoteCache = new Map<string, DexQuotes>(
      [
        [
          '0xERC20_1',
          new Map<string, DexQuote>([
            ['0xERC20_2',
              {
                quote: {
                  amount: {
                    value: BigNumber.from(1),
                    token: {} as TokenInfo,
                  },
                  amountWithMaxSlippage: {
                    value: BigNumber.from(1),
                    token: {} as TokenInfo,
                  },
                  slippage: 0,
                  fees: [
                    {
                      amount: {
                        value: BigNumber.from(1),
                        token: {} as TokenInfo,
                      },
                      recipient: '',
                      basisPoints: 0,
                    },
                  ],
                },
                approval: {
                  value: BigNumber.from(1),
                  token: {} as TokenInfo,
                },
                swap: {
                  value: BigNumber.from(1),
                  token: {} as TokenInfo,
                },
              },
            ],
          ]),
        ],
        [
          '0xERC20_2',
          new Map<string, DexQuote>([
            ['0xERC20_1',
              {
                quote: {
                  amount: {
                    value: BigNumber.from(2),
                    token: {} as TokenInfo,
                  },
                  amountWithMaxSlippage: {
                    value: BigNumber.from(2),
                    token: {} as TokenInfo,
                  },
                  slippage: 0,
                  fees: [
                    {
                      amount: {
                        value: BigNumber.from(2),
                        token: {} as TokenInfo,
                      },
                      recipient: '',
                      basisPoints: 0,
                    },
                  ],
                },
                approval: {
                  value: BigNumber.from(2),
                  token: {} as TokenInfo,
                },
                swap: {
                  value: BigNumber.from(2),
                  token: {} as TokenInfo,
                },
              },
            ],
          ]),
        ],
      ],
    );

    const quote = await getOrSetQuotesFromCache(
      config,
      cache,
      '0xADDRESS',
      {
        address: '0xERC20_1',
        amount: BigNumber.from(1),
      },
      ['0xERC20_2'],
    );

    expect(quote).toEqual(cache.get('0xERC20_1'));
    expect(quoteFetcher).not.toBeCalled();
  });

  it('should call dex if token address not in cache and update the cache', async () => {
    const quoteFetcherResponse = new Map<string, DexQuote>([
      ['0xERC20_2',
        {
          quote: {
            amount: {
              value: BigNumber.from(1),
              token: {} as TokenInfo,
            },
            amountWithMaxSlippage: {
              value: BigNumber.from(1),
              token: {} as TokenInfo,
            },
            slippage: 0,
            fees: [
              {
                amount: {
                  value: BigNumber.from(1),
                  token: {} as TokenInfo,
                },
                recipient: '',
                basisPoints: 0,
              },
            ],
          },
          approval: {
            value: BigNumber.from(1),
            token: {} as TokenInfo,
          },
          swap: {
            value: BigNumber.from(1),
            token: {} as TokenInfo,
          },
        },
      ],
    ]);

    (quoteFetcher as jest.Mock).mockReturnValue(quoteFetcherResponse);

    const config = new CheckoutConfiguration({
      baseConfig: { environment: Environment.SANDBOX },
    });

    const cache: DexQuoteCache = new Map<string, DexQuotes>(
      [
        [
          '0xERC20_2',
          new Map<string, DexQuote>([
            ['0xERC20_1',
              {
                quote: {
                  amount: {
                    value: BigNumber.from(2),
                    token: {} as TokenInfo,
                  },
                  amountWithMaxSlippage: {
                    value: BigNumber.from(2),
                    token: {} as TokenInfo,
                  },
                  slippage: 0,
                  fees: [
                    {
                      amount: {
                        value: BigNumber.from(2),
                        token: {} as TokenInfo,
                      },
                      recipient: '',
                      basisPoints: 0,
                    },
                  ],
                },
                approval: {
                  value: BigNumber.from(2),
                  token: {} as TokenInfo,
                },
                swap: {
                  value: BigNumber.from(2),
                  token: {} as TokenInfo,
                },
              },
            ],
          ]),
        ],
      ],
    );

    const quote = await getOrSetQuotesFromCache(
      config,
      cache,
      '0xADDRESS',
      {
        address: '0xERC20_1',
        amount: BigNumber.from(1),
      },
      ['0xERC20_2'],
    );

    expect(quote).toEqual(quoteFetcherResponse);
    expect(cache.get('0xERC20_1')).toEqual(quoteFetcherResponse);
    expect(quoteFetcher).toBeCalledTimes(1);
  });

  it('should call dex if cache is empty', async () => {
    const quoteFetcherResponse = new Map<string, DexQuote>([
      ['0xERC20_2',
        {
          quote: {
            amount: {
              value: BigNumber.from(1),
              token: {} as TokenInfo,
            },
            amountWithMaxSlippage: {
              value: BigNumber.from(1),
              token: {} as TokenInfo,
            },
            slippage: 0,
            fees: [
              {
                amount: {
                  value: BigNumber.from(1),
                  token: {} as TokenInfo,
                },
                recipient: '',
                basisPoints: 0,
              },
            ],
          },
          approval: {
            value: BigNumber.from(1),
            token: {} as TokenInfo,
          },
          swap: {
            value: BigNumber.from(1),
            token: {} as TokenInfo,
          },
        },
      ],
    ]);

    (quoteFetcher as jest.Mock).mockReturnValue(quoteFetcherResponse);

    const config = new CheckoutConfiguration({
      baseConfig: { environment: Environment.SANDBOX },
    });

    const cache: DexQuoteCache = new Map<string, DexQuotes>([]);

    const quote = await getOrSetQuotesFromCache(
      config,
      cache,
      '0xADDRESS',
      {
        address: '0xERC20_1',
        amount: BigNumber.from(1),
      },
      ['0xERC20_2'],
    );

    expect(quote).toEqual(quoteFetcherResponse);
    expect(cache.get('0xERC20_1')).toEqual(quoteFetcherResponse);
    expect(quoteFetcher).toBeCalledTimes(1);
  });
});
