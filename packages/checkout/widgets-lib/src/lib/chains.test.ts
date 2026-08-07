import { ChainId, ChainName, ChainSlug } from '@imtbl/checkout-sdk';
import {
  getChainIdBySlug, getChainNameById, getChainSlugById, parseChainId,
} from './chains';

describe('getChainNameById', () => {
  const tests = [
    { id: ChainId.IMTBL_ZKEVM_DEVNET, expected: ChainName.IMTBL_ZKEVM_DEVNET },
    { id: ChainId.IMTBL_ZKEVM_TESTNET, expected: ChainName.IMTBL_ZKEVM_TESTNET },
    { id: ChainId.IMTBL_ZKEVM_MAINNET, expected: ChainName.IMTBL_ZKEVM_MAINNET },
    { id: ChainId.ETHEREUM, expected: ChainName.ETHEREUM },
    { id: ChainId.SEPOLIA, expected: ChainName.SEPOLIA },
  ];

  tests.forEach(({ id, expected }) => {
    it(`should return ${expected} for chain id ${id}`, () => {
      expect(getChainNameById(id)).toEqual(expected);
    });
  });
});

describe('getChainSlugById', () => {
  const tests = [
    { id: ChainId.IMTBL_ZKEVM_DEVNET, expected: ChainSlug.IMTBL_ZKEVM_DEVNET },
    { id: ChainId.IMTBL_ZKEVM_TESTNET, expected: ChainSlug.IMTBL_ZKEVM_TESTNET },
    { id: ChainId.IMTBL_ZKEVM_MAINNET, expected: ChainSlug.IMTBL_ZKEVM_MAINNET },
    { id: ChainId.ETHEREUM, expected: ChainSlug.ETHEREUM },
    { id: ChainId.SEPOLIA, expected: ChainSlug.SEPOLIA },
  ];

  tests.forEach(({ id, expected }) => {
    it(`should return ${expected} for chain id ${id}`, () => {
      expect(getChainSlugById(id)).toEqual(expected);
    });
  });
});

describe('getChainIdBySlug', () => {
  const tests = [
    { id: ChainSlug.IMTBL_ZKEVM_DEVNET, expected: ChainId.IMTBL_ZKEVM_DEVNET },
    { id: ChainSlug.IMTBL_ZKEVM_TESTNET, expected: ChainId.IMTBL_ZKEVM_TESTNET },
    { id: ChainSlug.IMTBL_ZKEVM_MAINNET, expected: ChainId.IMTBL_ZKEVM_MAINNET },
    { id: ChainSlug.ETHEREUM, expected: ChainId.ETHEREUM },
    { id: ChainSlug.SEPOLIA, expected: ChainId.SEPOLIA },
  ];

  tests.forEach(({ id, expected }) => {
    it(`should return ${expected} for chain id ${id}`, () => {
      expect(getChainIdBySlug(id)).toEqual(expected);
    });
  });
});

describe('parseChainId', () => {
  // Regression: a lint autofix once rewrote `parseInt(chainId)` to
  // `parseInt(chainId, 10)`, which returns 0 for the hex values EIP-695
  // mandates. Every chain then read as "wrong network" and the bridge became
  // unusable. These cases pin the hex handling down.
  const hexCases = [
    { value: '0x343b', expected: ChainId.IMTBL_ZKEVM_MAINNET },
    { value: '0x34a1', expected: ChainId.IMTBL_ZKEVM_TESTNET },
    { value: '0x1', expected: ChainId.ETHEREUM },
    { value: '0xaa36a7', expected: ChainId.SEPOLIA },
  ];

  hexCases.forEach(({ value, expected }) => {
    it(`should parse hex ${value} as ${expected}`, () => {
      expect(parseChainId(value)).toEqual(expected);
    });
  });

  it('should parse a decimal string', () => {
    expect(parseChainId('13371')).toEqual(ChainId.IMTBL_ZKEVM_MAINNET);
  });

  it('should pass through a number', () => {
    expect(parseChainId(13371)).toEqual(ChainId.IMTBL_ZKEVM_MAINNET);
  });

  it('should parse a bigint', () => {
    expect(parseChainId(BigInt(13371))).toEqual(ChainId.IMTBL_ZKEVM_MAINNET);
  });

  const invalidCases = [null, undefined, '', 'not-a-chain', '0x', 0, -1, 1.5];

  invalidCases.forEach((value) => {
    it(`should return null for ${JSON.stringify(value)}`, () => {
      expect(parseChainId(value)).toBeNull();
    });
  });
});
