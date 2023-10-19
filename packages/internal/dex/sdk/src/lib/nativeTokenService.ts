import {
  Coin, CoinAmount, ERC20, Native,
} from 'types';
import { newAmount } from './utils';

export class NativeTokenService {
  constructor(readonly nativeToken: Coin, readonly wrappedToken: ERC20) {}

  wrapAmount(amount: CoinAmount<Coin>): CoinAmount<ERC20> {
    if (!this.isNativeToken(amount.token)) {
      throw new Error(`cannot wrap non-native token: ${amount.token.address}`);
    }
    return newAmount(amount.value, this.wrappedToken);
  }

  unwrapAmount(amount: CoinAmount<ERC20>): CoinAmount<Coin> {
    if (amount.token !== this.wrappedToken) {
      throw new Error(`cannot unwrap non-wrapped token ${amount.token.address}`);
    }
    return newAmount(amount.value, this.nativeToken);
  }

  maybeWrapToken(token: Coin): ERC20 {
    if (this.isNativeToken(token)) {
      return this.wrappedToken;
    }
    return token as ERC20;
  }

  maybeWrapAmount(amount: CoinAmount<Coin>): CoinAmount<ERC20> {
    return newAmount(amount.value, this.maybeWrapToken(amount.token));
  }

  isNativeToken(token: Coin): token is Native {
    return token === this.nativeToken;
  }
}
