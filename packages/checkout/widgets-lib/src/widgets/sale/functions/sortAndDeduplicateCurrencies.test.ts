import { SaleWidgetCurrency, SaleWidgetCurrencyType } from '../types';
import { sortAndDeduplicateCurrencies } from './sortAndDeduplicateCurrencies';

describe('sortAndDeduplicateCurrencies', () => {
  it('sortAndDeduplicateCurrencies', () => {
    const allCurrencies: SaleWidgetCurrency[] = [
      {
        base: true,
        decimals: 6,
        name: 'USDC',
        address: '0x3b2d8a1931736fc321c24864bceee981b11c3c57',
        exchangeId: 'usd-coin',
        currencyType: SaleWidgetCurrencyType.SETTLEMENT,
      },
      {
        base: false,
        decimals: 18,
        name: 'GOG',
        address: '0xb8ee289c64c1a0dc0311364721ada8c3180d838c',
        exchangeId: 'guild-of-guardians',
        currencyType: SaleWidgetCurrencyType.SETTLEMENT,
      },
      {
        base: false,
        decimals: 18,
        name: 'ETH',
        address: '0xe9e96d1aad82562b7588f03f49ad34186f996478',
        exchangeId: 'ethereum',
        currencyType: SaleWidgetCurrencyType.SETTLEMENT,
      },
      {
        name: 'Immutable Token',
        symbol: 'IMX',
        address: 'native',
        decimals: 18,
        currencyType: SaleWidgetCurrencyType.SWAPPABLE,
      },
      {
        name: 'Wrapped IMX',
        symbol: 'WIMX',
        address: '0x1CcCa691501174B4A623CeDA58cC8f1a76dc3439',
        decimals: 18,
        currencyType: SaleWidgetCurrencyType.SWAPPABLE,
      },
      {
        name: 'zkTDR',
        symbol: 'zkTDR',
        address: '0x6531F7B9158d78Ca78b46799c4Fd65C2Af8Ae506',
        decimals: 18,
        currencyType: SaleWidgetCurrencyType.SWAPPABLE,
      },
      {
        address: '0xB8EE289C64C1A0DC0311364721aDA8c3180D838C',
        name: 'GOG',
        symbol: 'GOG',
        decimals: 18,
        currencyType: SaleWidgetCurrencyType.SWAPPABLE,
      },
      {
        name: 'zkPSP',
        symbol: 'zkPSP',
        address: '0x88B35dF96CbEDF2946586147557F7D5D0CCE7e5c',
        decimals: 18,
        currencyType: SaleWidgetCurrencyType.SWAPPABLE,
      },
      {
        name: 'zkWLT',
        symbol: 'zkWLT',
        address: '0x8A5b0470ee48248bEb7D1E745c1EbA0DCA77215e',
        decimals: 18,
        currencyType: SaleWidgetCurrencyType.SWAPPABLE,
      },
      {
        name: 'zkSRE',
        symbol: 'zkSRE',
        address: '0x43566cAB87CC147C95e2895E7b972E19993520e4',
        decimals: 18,
        currencyType: SaleWidgetCurrencyType.SWAPPABLE,
      },
      {
        name: 'zkCORE',
        symbol: 'zkCORE',
        address: '0x4B96E7b7eA673A996F140d5De411a97b7eab934E',
        decimals: 18,
        currencyType: SaleWidgetCurrencyType.SWAPPABLE,
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        address: '0x3B2d8A1931736Fc321C24864BceEe981B11c3c57',
        decimals: 6,
        currencyType: SaleWidgetCurrencyType.SWAPPABLE,
      },
      {
        name: 'Monopoly',
        symbol: 'MPLY',
        address: '0x5fc1aBC911386e2A9FEfc874ab15E20A3434D2B9',
        decimals: 18,
        currencyType: SaleWidgetCurrencyType.SWAPPABLE,
      },
    ];

    const transformedCurrencies: SaleWidgetCurrency[] = [
      {
        base: true,
        decimals: 6,
        name: 'USDC',
        address: '0x3b2d8a1931736fc321c24864bceee981b11c3c57',
        exchangeId: 'usd-coin',
        currencyType: SaleWidgetCurrencyType.SETTLEMENT,
      },
      {
        base: false,
        decimals: 18,
        name: 'GOG',
        address: '0xb8ee289c64c1a0dc0311364721ada8c3180d838c',
        exchangeId: 'guild-of-guardians',
        currencyType: SaleWidgetCurrencyType.SETTLEMENT,
      },
      {
        base: false,
        decimals: 18,
        name: 'ETH',
        address: '0xe9e96d1aad82562b7588f03f49ad34186f996478',
        exchangeId: 'ethereum',
        currencyType: SaleWidgetCurrencyType.SETTLEMENT,
      },
      {
        name: 'Immutable Token',
        symbol: 'IMX',
        address: 'native',
        decimals: 18,
        currencyType: SaleWidgetCurrencyType.SWAPPABLE,
      },
      {
        name: 'Wrapped IMX',
        symbol: 'WIMX',
        address: '0x1CcCa691501174B4A623CeDA58cC8f1a76dc3439',
        decimals: 18,
        currencyType: SaleWidgetCurrencyType.SWAPPABLE,
      },
      {
        name: 'zkTDR',
        symbol: 'zkTDR',
        address: '0x6531F7B9158d78Ca78b46799c4Fd65C2Af8Ae506',
        decimals: 18,
        currencyType: SaleWidgetCurrencyType.SWAPPABLE,
      },
      {
        name: 'zkPSP',
        symbol: 'zkPSP',
        address: '0x88B35dF96CbEDF2946586147557F7D5D0CCE7e5c',
        decimals: 18,
        currencyType: SaleWidgetCurrencyType.SWAPPABLE,
      },
      {
        name: 'zkWLT',
        symbol: 'zkWLT',
        address: '0x8A5b0470ee48248bEb7D1E745c1EbA0DCA77215e',
        decimals: 18,
        currencyType: SaleWidgetCurrencyType.SWAPPABLE,
      },
      {
        name: 'zkSRE',
        symbol: 'zkSRE',
        address: '0x43566cAB87CC147C95e2895E7b972E19993520e4',
        decimals: 18,
        currencyType: SaleWidgetCurrencyType.SWAPPABLE,
      },
      {
        name: 'zkCORE',
        symbol: 'zkCORE',
        address: '0x4B96E7b7eA673A996F140d5De411a97b7eab934E',
        decimals: 18,
        currencyType: SaleWidgetCurrencyType.SWAPPABLE,
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        address: '0x3B2d8A1931736Fc321C24864BceEe981B11c3c57',
        decimals: 6,
        currencyType: SaleWidgetCurrencyType.SWAPPABLE,
      },
      {
        name: 'Monopoly',
        symbol: 'MPLY',
        address: '0x5fc1aBC911386e2A9FEfc874ab15E20A3434D2B9',
        decimals: 18,
        currencyType: SaleWidgetCurrencyType.SWAPPABLE,
      },
    ];

    expect(sortAndDeduplicateCurrencies(allCurrencies)).toStrictEqual(
      transformedCurrencies,
    );
  });
});
