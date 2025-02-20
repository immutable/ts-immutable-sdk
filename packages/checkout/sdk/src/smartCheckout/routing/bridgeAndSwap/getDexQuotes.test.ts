import { Environment } from '@imtbl/config';
import { CheckoutConfiguration } from '../../../config';
import { getDexQuotes } from './getDexQuotes';
import { BalanceNativeRequirement } from '../../balanceCheck/types';
import { quoteFetcher } from '../swap/quoteFetcher';
import { ChainId } from '../../../types';
import { HttpClient } from '../../../api/http';

jest.mock('../swap/quoteFetcher');

describe('getDexQuotes', () => {
  const mockedHttpClient = new HttpClient() as jest.Mocked<HttpClient>;
  const config = new CheckoutConfiguration({
    baseConfig: { environment: Environment.SANDBOX },
  }, mockedHttpClient);

  it('should send token addresses to the quote fetcher', async () => {
    (quoteFetcher as jest.Mock).mockResolvedValue({});

    await getDexQuotes(
      config,
      '0xOWNER',
      '0xREQUIRED',
      {
        delta: {
          balance: BigInt(1),
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

    expect(quoteFetcher).toBeCalledTimes(1);
    expect(quoteFetcher).toBeCalledWith(
      config,
      ChainId.IMTBL_ZKEVM_TESTNET,
      '0xOWNER',
      {
        address: '0xREQUIRED',
        amount: BigInt(1),
      },
      [
        '0xIMX',
        '0xYEET',
      ],
    );
  });
});
