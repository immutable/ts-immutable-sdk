import { TokenInfo } from '@imtbl/checkout-sdk';
import {
  validateFromAmount,
  validateFromToken,
  validateToToken,
  validateToAmount,
} from './SwapValidator';
import { SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
import { text } from '../../../resources/text/textConfig';

describe('SwapValidator', () => {
  const {
    noAmountInputted,
    noFromTokenSelected,
    noToTokenSelected,
    insufficientBalance,
  } = text.views[SwapWidgetViews.SWAP].validation;

  describe('validateFromToken', () => {
    it('should return error message if fromToken is undefined', () => {
      const fromToken = undefined;
      const result = validateFromToken(fromToken);
      expect(result).toEqual(noFromTokenSelected);
    });

    it('should return empty string if fromToken is available', () => {
      const fromToken: TokenInfo = {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
      };
      const result = validateFromToken(fromToken);
      expect(result).toEqual('');
    });
  });

  describe('validateFromAmount', () => {
    it('should return error message if amount is empty', () => {
      const amount = '';
      const result = validateFromAmount(amount);
      expect(result).toEqual(noAmountInputted);
    });

    it('should return error message if amount is 0', () => {
      const amount = '0';
      const result = validateFromAmount(amount);
      expect(result).toEqual(noAmountInputted);
    });

    it('should return error message if amount is 0.00', () => {
      const amount = '0';
      const result = validateFromAmount(amount);
      expect(result).toEqual(noAmountInputted);
    });

    it('should return error message if amount is greater than balance', () => {
      const amount = '2';
      const balance = '1';
      const result = validateFromAmount(amount, balance);
      expect(result).toEqual(insufficientBalance);
    });

    it('should return empty string if amount is less than balance', () => {
      const amount = '1';
      const balance = '2';
      const result = validateFromAmount(amount, balance);
      expect(result).toEqual('');
    });

    it('should return empty string if amount is equal to balance', () => {
      const amount = '1';
      const balance = '1';
      const result = validateFromAmount(amount, balance);
      expect(result).toEqual('');
    });

    it('should return empty string if balance is undefined', () => {
      const amount = '1';
      const result = validateFromAmount(amount);
      expect(result).toEqual('');
    });
  });

  describe('validateToToken', () => {
    it('should return error message if toToken is undefined', () => {
      const toToken = undefined;
      const result = validateToToken(toToken);
      expect(result).toEqual(noToTokenSelected);
    });

    it('should return empty string if toToken is available', () => {
      const toToken = {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
      };
      const result = validateToToken(toToken);
      expect(result).toEqual('');
    });
  });

  describe('validateToAmount', () => {
    it('should return error message if amount is empty', () => {
      const amount = '';
      const result = validateToAmount(amount);
      expect(result).toEqual('Please input amount');
    });

    it('should return error message if amount is 0', () => {
      const amount = '0';
      const result = validateToAmount(amount);
      expect(result).toEqual('Please input amount');
    });

    it('should return error message if amount is 0.00', () => {
      const amount = '0';
      const result = validateToAmount(amount);
      expect(result).toEqual('Please input amount');
    });

    it('should return empty string if amount is not empty', () => {
      const amount = '1';
      const result = validateToAmount(amount);
      expect(result).toEqual('');
    });
  });
});
