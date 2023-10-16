import { constants } from 'ethers';
import { TEST_FROM_ADDRESS } from '../test/utils';
import { isValidNonZeroAddress } from './utils';

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
      it('should return default native token decimals', () => {
        // ...
        expect(false).toBe(true);
      });
    });

    describe('when token is ERC20', () => {
      it('should call ERC20 contract for provided token address', () => {
        // ...
        expect(false).toBe(true);
      });
    });
  });
});
