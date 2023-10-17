import { constants } from 'ethers';
import {
  formatAmount,
  newAmountFromString, TEST_FROM_ADDRESS, WETH_TEST_TOKEN, WIMX_TEST_TOKEN,
} from '../test/utils';
import { isValidNonZeroAddress, subtractAmount } from './utils';

jest.mock('@ethersproject/contracts');

describe('utils', () => {
  describe('isValidNonZeroAddress', () => {
    it('should return false for zero address', () => {
      expect(isValidNonZeroAddress(constants.AddressZero)).toBe(false);
    });

    it('should return false for invalid address', () => {
      expect(isValidNonZeroAddress('0xinvalid')).toBe(false);
    });

    it('should return true for valid address', () => {
      expect(isValidNonZeroAddress(TEST_FROM_ADDRESS)).toBe(true);
    });
  });

  describe('getDecimals', () => {
    describe('when token is native', () => {
      it.todo('should return default native token decimals');
    });

    describe('when token is ERC20', () => {
      it.todo('should call ERC20 contract for provided token address');
    });
  });

  describe('subtract', () => {
    it('subtracts one from the other', () => {
      const a1 = newAmountFromString('3', WETH_TEST_TOKEN);
      const a2 = newAmountFromString('2', WETH_TEST_TOKEN);
      expect(formatAmount(subtractAmount(a1, a2))).toEqual('1.0');
    });

    it('throws error when different erc20', () => {
      const a1 = newAmountFromString('1', WETH_TEST_TOKEN);
      const a2 = newAmountFromString('1', WIMX_TEST_TOKEN);
      expect(() => subtractAmount(a1, a2)).toThrowError('Token mismatch: token addresses must be the same');
    });
  });
});
