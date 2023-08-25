import { utils } from 'ethers';
import { newAmount } from 'lib';
import {
  howMuchAmountOut, howMuchAmountIn, formatAmount, IMX_TEST_TOKEN, uniqBy, USDC_TEST_TOKEN, WETH_TEST_TOKEN,
} from './utils';

describe('exchangeAmount', () => {
  it('exactAmountIn: have 1 IMX - want WETH', () => {
    const exchangeRate = 10;
    const imxAmount = newAmount(utils.parseEther('1'), IMX_TEST_TOKEN);
    const wethAmount = howMuchAmountOut(imxAmount, WETH_TEST_TOKEN, exchangeRate);
    expect(formatAmount(wethAmount)).toEqual('10.0');
  });

  it('exactAmountOut: have 10 WETH - want IMX', () => {
    const exchangeRate = 10;
    const wethAmount = newAmount(utils.parseEther('10'), WETH_TEST_TOKEN);
    const imxAmount = howMuchAmountIn(wethAmount, IMX_TEST_TOKEN, exchangeRate);
    expect(formatAmount(imxAmount)).toEqual('1.0');
  });

  it('exactAmountIn: have 1 IMX - how much USDC?', () => {
    const exchangeRate = 10; // 1 IMX = 10 USDC
    const imxAmount = newAmount(utils.parseEther('1'), IMX_TEST_TOKEN);
    const usdcAmount = howMuchAmountOut(imxAmount, USDC_TEST_TOKEN, exchangeRate);
    expect(formatAmount(usdcAmount)).toEqual('10.0');
  });

  it('exactAmountIn: have 1 USDC - how much IMX?', () => {
    const exchangeRate = 10; // 1 USDC = 10 IMX
    const usdcAmount = newAmount(utils.parseUnits('1', USDC_TEST_TOKEN.decimals), USDC_TEST_TOKEN);
    const imxAmount = howMuchAmountOut(usdcAmount, IMX_TEST_TOKEN, exchangeRate);
    expect(formatAmount(imxAmount)).toEqual('10.0');
  });

  it.only('exactAmountOut: want 10 USDC - how much IMX?', () => {
    const exchangeRate = 10; // 1 USDC = 0.1 IMX
    const usdcAmount = newAmount(utils.parseUnits('10', USDC_TEST_TOKEN.decimals), USDC_TEST_TOKEN);
    const imxAmount = howMuchAmountIn(usdcAmount, IMX_TEST_TOKEN, exchangeRate);
    expect(formatAmount(imxAmount)).toEqual('1.0');
  });

  // it('exactAmountOut: want 1 IMX - how much USDC?', () => {
  //   const exchangeRate = 10; // 1 IMX = 10 USDC
  //   const imxAmount = newAmount(utils.parseEther('1'), IMX_TEST_TOKEN);
  //   const usdcAmount = howMuchAmountIn(imxAmount, USDC_TEST_TOKEN, exchangeRate);
  //   expect(formatAmount(usdcAmount)).toEqual('10.0');
  // });
});

describe('uniqBy', () => {
  describe('when given an array of numbers with Math.floor func', () => {
    it('returns only unique items using comparator', () => {
      const numeros = [2.3, 1.2, 2.1];
      const uniqueItems = uniqBy(numeros, Math.floor);

      expect(uniqueItems.length).toEqual(2);
      expect(uniqueItems).toContain(2.1);
      expect(uniqueItems).toContain(1.2);
    });
  });

  describe('when given an array of strings with custom comparator', () => {
    it('returns only unique items using comparator', () => {
      const names = ['keith', 'jeet', 'feena'];
      const uniqueItems = uniqBy(names, (name) => name[1]);

      expect(uniqueItems.length).toEqual(1);
      expect(uniqueItems).toContain('feena');
    });
  });
});
