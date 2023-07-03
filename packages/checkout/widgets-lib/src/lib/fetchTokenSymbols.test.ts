import { ChainId, Checkout } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { fetchTokenSymbols } from './fetchTokenSymbols';

describe('fetchTokenSymbols', () => {
  const checkout = new Checkout({
    baseConfig: { environment: Environment.SANDBOX },
  });

  it('should fetch token symbols and return eth and imx', async () => {
    checkout.getTokenAllowList = jest.fn().mockImplementationOnce(() => ({
      tokens: [
        { symbol: 'ETH' },
        { symbol: 'ETH' },
        { symbol: 'IMX' },
      ],
    }));

    expect(await fetchTokenSymbols(checkout, ChainId.ETHEREUM)).toStrictEqual(
      ['ETH', 'IMX'],
    );
  });
});
