import {
  amountOutFromAmountIn, amountInFromAmountOut, formatAmount, uniqBy,
  USDC_TEST_TOKEN, WETH_TEST_TOKEN, newAmountFromString, WIMX_TEST_TOKEN,
} from './utils';

describe('exchangeAmount', () => {
  describe('when the input and output token decimals are the same', () => {
    describe('when amount-in', () => {
      it('should multiply the amount-in by the exchange rate', () => {
        const exchangeRate = 10;
        const imxAmount = newAmountFromString('1', WIMX_TEST_TOKEN);
        const wethAmount = amountOutFromAmountIn(imxAmount, WETH_TEST_TOKEN, exchangeRate);
        expect(formatAmount(wethAmount)).toEqual('10.0');
      });
    });

    describe('when amount-out', () => {
      it('should divide the amount-out by the exchange rate', () => {
        const exchangeRate = 10;
        const wethAmount = newAmountFromString('10', WETH_TEST_TOKEN);
        const imxAmount = amountInFromAmountOut(wethAmount, WIMX_TEST_TOKEN, exchangeRate);
        expect(formatAmount(imxAmount)).toEqual('1.0');
      });
    });
  });

  describe('when the input token and output token decimals are different', () => {
    describe('when amount-in has higher decimals', () => {
      it('should multiply the amount-in by the exchange rate', () => {
        const exchangeRate = 10; // 1 IMX = 10 USDC
        const imxAmount = newAmountFromString('1', WIMX_TEST_TOKEN);
        const usdcAmount = amountOutFromAmountIn(imxAmount, USDC_TEST_TOKEN, exchangeRate);
        expect(formatAmount(usdcAmount)).toEqual('10.0');
      });
    });

    describe('when amount-in has lower decimals', () => {
      it('should multiply the amount-in by the exchange rate', () => {
        const exchangeRate = 10; // 1 USDC = 10 IMX
        const usdcAmount = newAmountFromString('1', USDC_TEST_TOKEN);
        const imxAmount = amountOutFromAmountIn(usdcAmount, WIMX_TEST_TOKEN, exchangeRate);
        expect(formatAmount(imxAmount)).toEqual('10.0');
      });
    });

    describe('when amount-out has higher decimals', () => {
      it('should divide the amount-out by the exchange rate', () => {
        const exchangeRate = 10; // 1 IMX = 10 USDC
        const imxAmount = newAmountFromString('10', WIMX_TEST_TOKEN);
        const usdcAmount = amountInFromAmountOut(imxAmount, USDC_TEST_TOKEN, exchangeRate);
        expect(formatAmount(usdcAmount)).toEqual('1.0');
      });
    });

    describe('when amount-out has lower decimals', () => {
      it('should divide the amount-out by the exchange rate', () => {
        const exchangeRate = 10; // 1 USDC = 0.1 IMX
        const usdcAmount = newAmountFromString('10', USDC_TEST_TOKEN);
        const imxAmount = amountInFromAmountOut(usdcAmount, WIMX_TEST_TOKEN, exchangeRate);
        expect(formatAmount(imxAmount)).toEqual('1.0');
      });
    });
  });
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
