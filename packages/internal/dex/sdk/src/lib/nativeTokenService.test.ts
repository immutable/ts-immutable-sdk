import {
  expectERC20,
  expectNative,
  formatAmount,
  FUN_TEST_TOKEN,
  nativeTokenService,
  newAmountFromString,
} from '../test/utils';
import { canUnwrapToken } from './nativeTokenService';

describe('NativeTokenService', () => {
  describe('wrapAmount', () => {
    it('converts native token amounts to their wrapped equivalent', () => {
      const nativeAmount = newAmountFromString('1', nativeTokenService.nativeToken);
      const wrappedEquivalent = nativeTokenService.wrapAmount(nativeAmount);
      expectERC20(wrappedEquivalent.token, nativeTokenService.wrappedToken.address);
      expect(formatAmount(wrappedEquivalent)).toEqual('1.0');
    });
  });

  describe('unwrapAmount', () => {
    it('should convert when object references are different', () => {
      // Make a new wrappedToken instance
      const wrappedAmount = newAmountFromString('1', { ...nativeTokenService.wrappedToken });
      const nativeEquivalent = nativeTokenService.unwrapAmount(wrappedAmount);

      expectNative(nativeEquivalent.token);
      expect(formatAmount(nativeEquivalent)).toEqual('1.0');
    });

    it('should convert when token addresses have mixed casing', () => {
      const newWrappedToken = { ...nativeTokenService.wrappedToken };
      newWrappedToken.address = newWrappedToken.address.toUpperCase();

      const wrappedAmount = newAmountFromString('1', newWrappedToken);
      const nativeEquivalent = nativeTokenService.unwrapAmount(wrappedAmount);

      expectNative(nativeEquivalent.token);
      expect(formatAmount(nativeEquivalent)).toEqual('1.0');
    });

    it('converts wrapped token amounts to their native equivalent', () => {
      const wrappedAmount = newAmountFromString('1', nativeTokenService.wrappedToken);
      const nativeEquivalent = nativeTokenService.unwrapAmount(wrappedAmount);

      expectNative(nativeEquivalent.token);
      expect(formatAmount(nativeEquivalent)).toEqual('1.0');
    });

    it('throws an error if the token is not a wrapped native amount', () => {
      const erc20Amount = newAmountFromString('1', FUN_TEST_TOKEN);
      expect(() => nativeTokenService.unwrapAmount(erc20Amount)).toThrowError(
        'cannot unwrap non-wrapped token 0xCc7bb2D219A0FC08033E130629C2B854b7bA9195',
      );
    });
  });

  describe('maybeWrapToken', () => {
    it('wraps native tokens', () => {
      const wrappedToken = nativeTokenService.maybeWrapToken(nativeTokenService.nativeToken);
      expectERC20(wrappedToken);
    });

    it('does not wrap an already wrapped token', () => {
      const stillTheWrappedToken = nativeTokenService.maybeWrapToken(nativeTokenService.wrappedToken);
      expect(stillTheWrappedToken).toEqual(nativeTokenService.wrappedToken);
    });

    it('does not wrap a normal ERC20 token', () => {
      const stillTheFunToken = nativeTokenService.maybeWrapToken(FUN_TEST_TOKEN);
      expect(stillTheFunToken).toEqual(stillTheFunToken);
    });
  });

  describe('maybeWrapAmount', () => {
    it('wraps native amounts', () => {
      const nativeAmount = newAmountFromString('1', nativeTokenService.nativeToken);
      const wrappedEquivalent = nativeTokenService.maybeWrapAmount(nativeAmount);
      expectERC20(wrappedEquivalent.token, nativeTokenService.wrappedToken.address);
      expect(formatAmount(wrappedEquivalent)).toEqual('1.0');
    });

    it('does not wrap an already wrapped amount', () => {
      const wrappedAmount = newAmountFromString('1', nativeTokenService.wrappedToken);
      const stillTheWrappedAmount = nativeTokenService.maybeWrapAmount(wrappedAmount);
      expect(stillTheWrappedAmount).toEqual(wrappedAmount);
    });

    it('does not wrap a normal ERC20 amount', () => {
      const erc20Amount = newAmountFromString('1', FUN_TEST_TOKEN);
      const stillTheFunAmount = nativeTokenService.maybeWrapAmount(erc20Amount);
      expect(stillTheFunAmount).toEqual(erc20Amount);
    });
  });

  describe('canUnwrapToken', () => {
    it('returns true for the native token', () => {
      expect(canUnwrapToken(nativeTokenService.nativeToken)).toEqual(true);
    });

    it('returns false for the wrapped token', () => {
      expect(canUnwrapToken(nativeTokenService.wrappedToken)).toEqual(false);
    });

    it('returns false for a normal ERC20 token', () => {
      expect(canUnwrapToken(FUN_TEST_TOKEN)).toEqual(false);
    });
  });
});
