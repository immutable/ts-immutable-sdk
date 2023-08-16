import { providers, constants, Contract } from 'ethers';
import { SecondaryFee__factory } from 'contracts/types';
import {
  TEST_CHAIN_ID,
  TEST_FROM_ADDRESS,
  TEST_RPC_URL,
  TEST_SECONDARY_FEE_ADDRESS,
} from '../test/utils';
import { isSecondaryFeeContractPaused, isValidNonZeroAddress } from './utils';

jest.mock('@ethersproject/contracts');

describe('utils', () => {
  describe('isSecondaryFeeContractPaused', () => {
    let mockedContract: jest.Mock;

    it('should return true if paused', async () => {
      mockedContract = (Contract as unknown as jest.Mock).mockImplementationOnce(() => ({
        paused: jest.fn().mockResolvedValue(true),
      }));

      const provider = new providers.JsonRpcProvider(
        TEST_RPC_URL,
        TEST_CHAIN_ID,
      );
      const secondaryFeeContract = SecondaryFee__factory.connect(TEST_SECONDARY_FEE_ADDRESS, provider);

      const isPaused = await isSecondaryFeeContractPaused(secondaryFeeContract);

      expect(mockedContract).toBeCalledTimes(1);
      expect(isPaused).toBe(true);
    });

    it('should return false if not paused', async () => {
      mockedContract = (Contract as unknown as jest.Mock).mockImplementationOnce(() => ({
        paused: jest.fn().mockResolvedValue(false),
      }));

      const provider = new providers.JsonRpcProvider(
        TEST_RPC_URL,
        TEST_CHAIN_ID,
      );
      const secondaryFeeContract = SecondaryFee__factory.connect(TEST_SECONDARY_FEE_ADDRESS, provider);

      const isPaused = await isSecondaryFeeContractPaused(secondaryFeeContract);

      expect(mockedContract).toBeCalledTimes(1);
      expect(isPaused).toBe(false);
    });
  });
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
});
