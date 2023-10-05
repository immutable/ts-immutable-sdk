import { Environment } from '@imtbl/config';
import { BigNumber } from 'ethers';
import { CheckoutConfiguration } from '../../../config';
import { getDexQuotes } from './getDexQuotes';
import { BalanceNativeRequirement } from '../../balanceCheck/types';
import { DexQuoteCache } from '../types';
import { getOrSetQuotesFromCache } from '../swap/dexQuoteCache';

jest.mock('../swap/dexQuoteCache');

describe('getDexQuotes', () => {
  const config = new CheckoutConfiguration({
    baseConfig: { environment: Environment.SANDBOX },
  });

  it('should send token addresses to getOrSetQuotesFromCache', async () => {
    (getOrSetQuotesFromCache as jest.Mock).mockResolvedValue({});

    await getDexQuotes(
      config,
      {} as DexQuoteCache,
      '0xOWNER',
      '0xREQUIRED',
      {
        delta: {
          balance: BigNumber.from(1),
        },
      } as BalanceNativeRequirement,
      [
        {
          address: '0xIMX',
          name: 'IMX',
          symbol: 'IMX',
          decimals: 18,
        },
        {
          address: '0xYEET',
          name: 'zkYEET',
          symbol: 'zkYEET',
          decimals: 18,
        },
      ],
    );

    expect(getOrSetQuotesFromCache).toBeCalledTimes(1);
    expect(getOrSetQuotesFromCache).toBeCalledWith(
      config,
      {},
      '0xOWNER',
      {
        address: '0xREQUIRED',
        amount: BigNumber.from(1),
      },
      [
        '0xIMX',
        '0xYEET',
      ],
    );
  });
});
