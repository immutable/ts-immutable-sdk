import { Coin, CoinAmount, ERC20, Native } from '../types';
import { newAmount } from './utils';

export const canUnwrapToken = (token: Coin): token is Native => token.type === 'native';

export class NativeTokenService {
  constructor(readonly nativeToken: Native, readonly wrappedToken: ERC20) {}

  wrapAmount(amount: CoinAmount<Native>): CoinAmount<ERC20> {
    return newAmount(amount.value, this.wrappedToken);
  }

  unwrapAmount(amount: CoinAmount<ERC20>): CoinAmount<Coin> {
    const isWrappedToken = amount.token.address.toLowerCase() !== this.wrappedToken.address.toLowerCase();
    if (isWrappedToken) {
      throw new Error(`cannot unwrap non-wrapped token ${amount.token.address}`);
    }
    return newAmount(amount.value, this.nativeToken);
  }

  maybeWrapToken(token: Coin): ERC20 {
    if (canUnwrapToken(token)) {
      return this.wrappedToken;
    }
    return token as ERC20;
  }

  maybeWrapAmount(amount: CoinAmount<Coin>): CoinAmount<ERC20> {
    return newAmount(amount.value, this.maybeWrapToken(amount.token));
  }

  private isWrappedNative(token: Coin): boolean {
    return token.type === 'erc20' && token.address.toLowerCase() === this.wrappedToken.address.toLowerCase();
  }

  isWrapOrUnwrap(tokenIn: Coin, tokenOut: Coin): boolean {
    return (
      (
        tokenIn === this.nativeToken && (
          this.isWrappedNative(tokenOut)
        )
      ) ||
      (
        (
          this.isWrappedNative(tokenIn)
        ) && tokenOut === this.nativeToken
      )
    );
  }
}
