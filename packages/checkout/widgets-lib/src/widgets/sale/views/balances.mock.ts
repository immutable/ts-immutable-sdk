import { BigNumber } from 'ethers';

export enum CurrencyType {
  SWAPPABLE = 'swappable',
  SETTLEMENT = 'settlement',
}

export type SettlementCurrency = {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  base: boolean;
  icon?: string;
  exchangeId?: string;
  currencyType: CurrencyType;
  userBalance: {
    balance: BigNumber;
    formattedBalance: string;
  };
};

export const allCurrencies: SettlementCurrency[] = [
  {
    base: true,
    decimals: 6,
    name: 'USDC',
    address: '0x3b2d8a1931736fc321c24864bceee981b11c3c57',
    exchangeId: 'usd-coin',
    symbol: 'USDC',
    userBalance: {
      balance: BigNumber.from('1'),
      formattedBalance: '1',
    },
    currencyType: CurrencyType.SETTLEMENT,
  },
  {
    base: false,
    decimals: 18,
    name: 'GOG',
    address: '0xb8ee289c64c1a0dc0311364721ada8c3180d838c',
    exchangeId: 'guild-of-guardians',
    symbol: 'GOG',
    userBalance: {
      balance: BigNumber.from('1'),
      formattedBalance: '1',
    },
    currencyType: CurrencyType.SETTLEMENT,
  },
  {
    base: false,
    decimals: 18,
    name: 'ETH',
    address: '0xe9e96d1aad82562b7588f03f49ad34186f996478',
    exchangeId: 'ethereum',
    symbol: 'ETH',
    userBalance: {
      balance: BigNumber.from('1'),
      formattedBalance: '1',
    },
    currencyType: CurrencyType.SWAPPABLE,
  },
  {
    name: 'Monopoly',
    symbol: 'MPLY',
    address: '0x5fc1aBC911386e2A9FEfc874ab15E20A3434D2B9',
    decimals: 18,
    base: false,
    currencyType: CurrencyType.SWAPPABLE,
    userBalance: {
      balance: BigNumber.from('1'),
      formattedBalance: '1',
    },
  },
];
