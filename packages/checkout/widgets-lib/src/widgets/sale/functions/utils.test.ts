import { ethers } from 'ethers';
import {
  getAmountWith1PercentSlippage,
  hexToText, sanitizeToLatin1, toPascalCase, toStringifyTransactions,
} from './utils';

describe('utils', () => {
  it('toStringifyTransactions', () => {
    const transactions = [
      { method: 'method1', hash: 'hash1' },
      { method: 'method2', hash: 'hash2' },
    ];
    expect(toStringifyTransactions(transactions)).toBe(
      'method1: hash1 | method2: hash2',
    );
  });

  it('toPascalCase', () => {
    expect(toPascalCase('with space')).toBe('WithSpace');
    expect(toPascalCase('with_underscore')).toBe('WithUnderscore');
    expect(toPascalCase('with_a-mixed case')).toBe('WithAMixedCase');
  });

  it('sanitizeToLatin1', () => {
    expect(sanitizeToLatin1('hello')).toBe('hello');
    expect(sanitizeToLatin1('你好')).toBe('');
  });

  it('hexToText', () => {
    expect(hexToText('0x505336323932')).toBe('PS6292');
    expect(
      hexToText('73656e644d65737361676528737472696e67206d6573736167652c206164647265737320746f29'),
    ).toBe('sendMessage(string message, address to)');
  });

  describe('getAmountWithMaxSlippage', () => {
    it('returns the value with 1% slippage - 100', () => {
      const amountOutWei = ethers.utils.parseEther('100');
      const result = getAmountWith1PercentSlippage(amountOutWei);
      const formattedResult = ethers.utils.formatEther(result);
      expect(formattedResult).toEqual('101.0');
    });

    it('returns the value with 1% slippage - 10', () => {
      const amountOutWei = ethers.utils.parseEther('10');
      const result = getAmountWith1PercentSlippage(amountOutWei);
      const formattedResult = ethers.utils.formatEther(result);
      expect(formattedResult).toEqual('10.1');
    });

    it('returns the value with 1% slippage - 1', () => {
      const amountOutWei = ethers.utils.parseEther('1');
      const result = getAmountWith1PercentSlippage(amountOutWei);
      const formattedResult = ethers.utils.formatEther(result);
      expect(formattedResult).toEqual('1.01');
    });

    it('returns the value with 1% slippage - 99.99', () => {
      const amountOutWei = ethers.utils.parseEther('99.99');
      const result = getAmountWith1PercentSlippage(amountOutWei);
      const formattedResult = ethers.utils.formatEther(result);
      expect(formattedResult).toEqual('100.9899');
    });

    it('returns the value with 1% slippage - 0', () => {
      const amountOutWei = ethers.utils.parseEther('0');
      const result = getAmountWith1PercentSlippage(amountOutWei);
      const formattedResult = ethers.utils.formatEther(result);
      expect(formattedResult).toEqual('0.0');
    });
  });
});
