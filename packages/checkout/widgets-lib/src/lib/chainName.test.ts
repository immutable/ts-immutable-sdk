import { ChainId, ChainName } from '@imtbl/checkout-sdk';
import { getChainNameById } from './chainName';

describe('getChainNameById', () => {
  const chainNameTestCases = [
    { id: ChainId.IMTBL_ZKEVM_DEVNET, expectedName: ChainName.IMTBL_ZKEVM_DEVNET },
    { id: ChainId.IMTBL_ZKEVM_TESTNET, expectedName: ChainName.IMTBL_ZKEVM_TESTNET },
    { id: ChainId.IMTBL_ZKEVM_MAINNET, expectedName: ChainName.IMTBL_ZKEVM_MAINNET },
    { id: ChainId.ETHEREUM, expectedName: ChainName.ETHEREUM },
    { id: ChainId.SEPOLIA, expectedName: ChainName.SEPOLIA },
  ];

  chainNameTestCases.forEach(({ id, expectedName }) => {
    it(`should return ${expectedName} for chain id ${id}`, () => {
      expect(getChainNameById(id)).toEqual(expectedName);
    });
  });
});
