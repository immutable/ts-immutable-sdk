import { ethers } from 'ethers';

export class NativeCurrency {}

export class Token {
  readonly address: string;

  readonly chainId: number;

  readonly decimals: number;

  readonly symbol?: string;

  readonly name?: string;

  constructor(chainId: number, address: string, decimals: number, symbol?: string, name?: string) {
    this.address = address;
    this.chainId = chainId;
    this.decimals = decimals;
    this.symbol = symbol;
    this.name = name;
  }
}

export type Currency = NativeCurrency | Token;

export class CurrencyAmount<T extends Currency> {
  readonly currency: T;

  readonly value: ethers.BigNumber;

  constructor(currency: T, value: ethers.BigNumber) {
    this.currency = currency;
    this.value = value;
  }

  add(other: CurrencyAmount<T>): CurrencyAmount<T> {
    return new CurrencyAmount(this.currency, this.value.add(other.value));
  }

  sub(other: CurrencyAmount<T>): CurrencyAmount<T> {
    return new CurrencyAmount(this.currency, this.value.sub(other.value));
  }
}
