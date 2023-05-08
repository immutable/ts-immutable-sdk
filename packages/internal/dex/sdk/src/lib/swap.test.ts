import { describe, it } from '@jest/globals';
import { ethers } from 'ethers';
import { DEFAULT_SLIPPAGE } from '../constants';
import { getAmountWithSlippageImpact } from './swap';
import { TradeType } from '@uniswap/sdk-core';

describe('getAmountWithSlippageImpact', () => {
  it('do something', () => {
    const amount = ethers.BigNumber.from('100');
    const slippage = DEFAULT_SLIPPAGE;

    const result = getAmountWithSlippageImpact(
      TradeType.EXACT_INPUT,
      amount,
      slippage
    );
    console.log('result', result.toString());
  });
});
