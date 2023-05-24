import { GetBalanceResult } from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import {
  ValidateFromAmount, ValidateFromToken, ValidateToToken, ValidateToAmount, ValidateTokens,
} from './SwapValidator';

describe('SwapValidator', () => {
  describe('ValidateFromToken', () => {
    it('should return error message if fromToken is null', () => {
      const fromToken = null;
      const result = ValidateFromToken(fromToken);
      expect(result).toEqual('Select a coin to swap');
    });

    it('should return empty string if fromToken is not null', () => {
      const fromToken: GetBalanceResult = {
        balance: BigNumber.from(1),
        formattedBalance: '1',
        token: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
      };
      const result = ValidateFromToken(fromToken);
      expect(result).toEqual('');
    });
  });

  describe('ValidateFromAmount', () => {
    it('should return error message if amount is empty', () => {
      const amount = '';
      const result = ValidateFromAmount(amount);
      expect(result).toEqual('Please input amount');
    });

    it('should return error message if amount is 0', () => {
      const amount = '0';
      const result = ValidateFromAmount(amount);
      expect(result).toEqual('Please input amount');
    });

    it('should return error message if amount is 0.00', () => {
      const amount = '0';
      const result = ValidateFromAmount(amount);
      expect(result).toEqual('Please input amount');
    });

    it('should return error message if amount is greater than balance', () => {
      const amount = '2';
      const balance = '1';
      const result = ValidateFromAmount(amount, balance);
      expect(result).toEqual('Insufficient balance');
    });

    it('should return empty string if amount is less than balance', () => {
      const amount = '1';
      const balance = '2';
      const result = ValidateFromAmount(amount, balance);
      expect(result).toEqual('');
    });

    it('should return empty string if amount is equal to balance', () => {
      const amount = '1';
      const balance = '1';
      const result = ValidateFromAmount(amount, balance);
      expect(result).toEqual('');
    });

    it('should return empty string if balance is undefined', () => {
      const amount = '1';
      const result = ValidateFromAmount(amount);
      expect(result).toEqual('');
    });
  });

  describe('ValidateToToken', () => {
    it('should return error message if toToken is null', () => {
      const toToken = null;
      const result = ValidateToToken(toToken);
      expect(result).toEqual('Select a coin to receive');
    });

    it('should return empty string if toToken is not null', () => {
      const toToken = {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
      };
      const result = ValidateToToken(toToken);
      expect(result).toEqual('');
    });
  });

  describe('ValidateToAmount', () => {
    it('should return error message if amount is empty', () => {
      const amount = '';
      const result = ValidateToAmount(amount);
      expect(result).toEqual('Please input amount');
    });

    it('should return error message if amount is 0', () => {
      const amount = '0';
      const result = ValidateToAmount(amount);
      expect(result).toEqual('Please input amount');
    });

    it('should return error message if amount is 0.00', () => {
      const amount = '0';
      const result = ValidateToAmount(amount);
      expect(result).toEqual('Please input amount');
    });

    it('should return empty string if amount is not empty', () => {
      const amount = '1';
      const result = ValidateToAmount(amount);
      expect(result).toEqual('');
    });
  });

  describe('ValidateTokens', () => {
    it('should return error message if fromToken and toToken are the same', () => {
      const fromToken = {
        balance: BigNumber.from(1),
        formattedBalance: '1',
        token: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
      };
      const toToken = {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
      };
      const result = ValidateTokens(fromToken, toToken);
      expect(result).toEqual('From and to tokens must be different');
    });

    it('should return empty string if fromToken and toToken are not the same', () => {
      const fromToken = {
        balance: BigNumber.from(1),
        formattedBalance: '1',
        token: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
      };
      const toToken = {
        name: 'IMX',
        symbol: 'IMX',
        decimals: 18,
      };
      const result = ValidateTokens(fromToken, toToken);
      expect(result).toEqual('');
    });
  });
});
