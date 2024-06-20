import { ChainId } from '../types';
import { formatSmartCheckoutAmount, isMatchingAddress, isZkEvmChainId } from './utils';

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

  describe('formatSmartCheckoutAmount', () => {
    const formatTokenAmountPatterns = [
      { amount: '0.1234567', expected: '0.123457' },
      { amount: '0.1234561', expected: '0.123457' },
      { amount: '0.1234560', expected: '0.123456' },
      { amount: '0.1234', expected: '0.1234' },
      { amount: '120.100001', expected: '120.100001' },
      { amount: '120.1000011', expected: '120.100002' },
      { amount: '120.1000019', expected: '120.100002' },
      { amount: '120.10000101', expected: '120.100002' },
      { amount: '0.000000000000000001', expected: '0.000001' },
    ];
    it.each(formatTokenAmountPatterns)('.formatTokenAmount($amount)', ({ amount, expected }) => {
      expect(formatSmartCheckoutAmount(amount)).toEqual(expected);
    });
  });
});
