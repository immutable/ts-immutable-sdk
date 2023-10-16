/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/lines-between-class-members */
import { ethers } from 'ethers';

export class NativeCurrency {
  readonly isNative: true;
  readonly isToken: false;

  constructor(readonly chainId: number, readonly decimals: number, readonly symbol?: string, readonly name?: string) {
    this.chainId = chainId;
    this.decimals = decimals;
    this.symbol = symbol;
    this.name = name;
    this.isNative = true;
    this.isToken = false;
  }

  // eslint-disable-next-line class-methods-use-this
  wrap(wrappedNativeToken: Token) {
    return wrappedNativeToken;
  }

  // get wrap(wrappedNativeToken: Token): Token {
  //   return new Token(this.chainId, ethers.constants.AddressZero, this.decimals, this.symbol, this.name);
  // }
}

export class Token {
  // readonly isNative: false;
  // readonly isToken: true;

  constructor(
    readonly chainId: number,
    readonly address: string,
    readonly decimals: number,
    readonly symbol?: string,
    readonly name?: string,
  ) {
    this.address = address;
    this.chainId = chainId;
    this.decimals = decimals;
    this.symbol = symbol;
    this.name = name;
    // this.isNative = false;
    // this.isToken = true;
  }

  wrap(): Token {
    return this;
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

  wrap(wrappedNativeToken: Token): CurrencyAmount<Token> {
    const token = this.currency.wrap(wrappedNativeToken);
    return new CurrencyAmount(token, this.value);
  }
}
