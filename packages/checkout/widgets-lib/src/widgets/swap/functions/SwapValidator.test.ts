import { GetBalanceResult } from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import {
  ValidateFromAmount, ValidateFromToken, ValidateToToken, ValidateToAmount,
} from './SwapValidator';

describe('SwapValidator', () => {
  describe('ValidateFromToken', () => {
    it('should return error message if swapFromToken is null', () => {
      const swapFromToken = null;
      const result = ValidateFromToken(swapFromToken);
      expect(result).toEqual('Select a coin to swap');
    });

    it('should return empty string if swapFromToken is not null', () => {
      const swapFromToken: GetBalanceResult = {
        balance: BigNumber.from(1),
        formattedBalance: '1',
        token: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
      };
      const result = ValidateFromToken(swapFromToken);
      expect(result).toEqual('');
    });
  });

  describe('ValidateFromAmount', () => {
    it('should return error message if amount is empty', () => {
      const amount = '';
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
    it('should return error message if swapToToken is null', () => {
      const swapToToken = null;
      const result = ValidateToToken(swapToToken);
      expect(result).toEqual('Select a coin to receive');
    });

    it('should return empty string if swapToToken is not null', () => {
      const swapToToken = {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
      };
      const result = ValidateToToken(swapToToken);
      expect(result).toEqual('');
    });
  });

  describe('ValidateToAmount', () => {
    it('should return error message if amount is empty', () => {
      const amount = '';
      const result = ValidateToAmount(amount);
      expect(result).toEqual('Please input amount');
    });

    it('should return empty string if amount is not empty', () => {
      const amount = '1';
      const result = ValidateToAmount(amount);
      expect(result).toEqual('');
    });
  });
});
