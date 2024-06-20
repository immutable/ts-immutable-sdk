import {
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
});
