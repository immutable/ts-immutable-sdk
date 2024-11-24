/* eslint-disable @typescript-eslint/naming-convention */
import { getPricingBySymbol } from './pricing';

describe('getPricingBySymbol', () => {
  const mockPrices = {
    ETH: {
      amount: 0.000668,
      currency: 'ETH',
      type: 'crypto',
    },
    GOG: {
      amount: 8.45852,
      currency: 'GOG',
      type: 'crypto',
    },
    USD: {
      amount: 2,
      currency: 'USD',
      type: 'fiat',
    },
    USDC: {
      amount: 2,
      currency: 'USDC',
      type: 'crypto',
    },
  };

  const mockConversions = new Map([
    ['eth', 2991.29],
    ['gog', 0.23619],
    ['imx', 2.05],
    ['usdc', 0.999787],
  ]);

  it('returns undefined if prices is undefined', () => {
    expect(getPricingBySymbol('eth', undefined, mockConversions)).toBeUndefined();
  });

  it('returns correct pricing without conversion', () => {
    expect(getPricingBySymbol('eth', mockPrices, mockConversions)).toEqual({
      currency: 'ETH',
      type: 'crypto',
      amount: 0.000668,
    });
  });

  it('returns pricing using an overridden symbol from conversions', () => {
    expect(getPricingBySymbol('tIMX', mockPrices, mockConversions)).toEqual({
      currency: 'tIMX',
      type: 'crypto',
      amount: 0.9756097560975611,
    });
  });

  it('returns undefined if symbol and override are not found', () => {
    expect(getPricingBySymbol('xyz', mockPrices, mockConversions)).toBeUndefined();
  });
});
