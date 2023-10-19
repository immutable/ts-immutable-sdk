import {
  Amount, Coin, ERC20, Native,
} from 'types/private';
import { newAmount } from './utils';

export class NativeTokenService {
  constructor(readonly nativeToken: Native, readonly wrappedToken: ERC20) {}

  wrapAmount(amount: Amount<Native>): Amount<ERC20> {
    return newAmount(amount.value, this.wrappedToken);
  }

  unwrapAmount(amount: Amount<ERC20>): Amount<Native> {
    if (amount.token !== this.wrappedToken) {
      throw new Error(`token ${amount.token.address} is not wrapped`);
    }
    return newAmount(amount.value, this.nativeToken);
  }

  maybeWrapToken(token: Coin): ERC20 {
    if (this.isNativeToken(token)) {
      return this.wrappedToken;
    }
    return token as ERC20;
  }

  maybeWrapAmount(amount: Amount<Coin>): Amount<ERC20> {
    return newAmount(amount.value, this.maybeWrapToken(amount.token));
  }

  isNativeToken(token: Coin): token is Native {
    return token === this.nativeToken;
  }
}
