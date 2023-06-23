import { describe, it } from '@jest/globals';
import { ethers } from 'ethers';
import { Percent, TradeType } from '@uniswap/sdk-core';
import { getAmountWithSlippageImpact } from './getQuote';

const DEFAULT_SLIPPAGE = new Percent(1, 1000);
describe('getAmountWithSlippageImpact', () => {
  describe('when trade type is EXACT_INPUT', () => {
    it('should return a minimum expected amount out', () => {
      const amountInWei = ethers.utils.parseEther('100');

      const result = getAmountWithSlippageImpact(
        TradeType.EXACT_INPUT,
        amountInWei,
        DEFAULT_SLIPPAGE,
      );

      const formattedResult = ethers.utils.formatEther(result);

      expect(formattedResult).toEqual('99.9');
    });

    describe('AND slippage percent is 0', () => {
      it('should return the same amount', () => {
        const amountInWei = ethers.utils.parseEther('100');
        const ZERO_PERCENT = new Percent(0, 0);

        const result = getAmountWithSlippageImpact(
          TradeType.EXACT_INPUT,
          amountInWei,
          ZERO_PERCENT,
        );

        const formattedResult = ethers.utils.formatEther(result);

        expect(formattedResult).toEqual('100.0');
      });
    });
  });

  describe('when trade type is EXACT_OUTPUT', () => {
    it('should return a maximum possible amount in', () => {
      const amountOutWei = ethers.utils.parseEther('100');

      const result = getAmountWithSlippageImpact(
        TradeType.EXACT_OUTPUT,
        amountOutWei,
        DEFAULT_SLIPPAGE,
      );

      const formattedResult = ethers.utils.formatEther(result);

      expect(formattedResult).toEqual('100.1');
    });

    describe('AND slippage percent is 0', () => {
      it('should return the same amount', () => {
        const amountOutWei = ethers.utils.parseEther('100');
        const ZERO_PERCENT = new Percent(0, 0);

        const result = getAmountWithSlippageImpact(
          TradeType.EXACT_OUTPUT,
          amountOutWei,
          ZERO_PERCENT,
        );

        const formattedResult = ethers.utils.formatEther(result);

        expect(formattedResult).toEqual('100.0');
      });
    });
  });
});
