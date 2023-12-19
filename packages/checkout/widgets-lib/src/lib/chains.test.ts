import { ChainId, ChainName, ChainSlug } from '@imtbl/checkout-sdk';
import { getChainIdBySlug, getChainNameById, getChainSlugById } from './chains';

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
