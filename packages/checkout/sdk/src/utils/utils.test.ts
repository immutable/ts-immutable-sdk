import { ChainId } from '../types';
import { isMatchingAddress, isZkEvmChainId } from './utils';

describe('utils', () => {
  it('should return true if addresses are the same', () => {
    const address = isMatchingAddress('0x123', '0x123');
    expect(address).toBeTruthy();
  });

  it('should return true if addresses are the same with different casing', () => {
    const address = isMatchingAddress('0xABC123', '0xabc123');
    expect(address).toBeTruthy();
  });

  it('should return false if addresses do not match', () => {
    const address = isMatchingAddress('0x123', '0x1234');
    expect(address).toBeFalsy();
  });

  describe('isZkEvmChainId', () => {
    it('should return true if devnet zkEVM chain', () => {
      const chainId = isZkEvmChainId(ChainId.IMTBL_ZKEVM_DEVNET);
      expect(chainId).toBeTruthy();
    });

    it('should return true if testnet zkEVM chain', () => {
      const chainId = isZkEvmChainId(ChainId.IMTBL_ZKEVM_TESTNET);
      expect(chainId).toBeTruthy();
    });

    it('should return true if mainnet zkEVM chain', () => {
      const chainId = isZkEvmChainId(ChainId.IMTBL_ZKEVM_MAINNET);
      expect(chainId).toBeTruthy();
    });

    it('should return false if not zkEVM chain', () => {
      const chainId = isZkEvmChainId(ChainId.SEPOLIA);
      expect(chainId).toBeFalsy();
    });
  });
});
